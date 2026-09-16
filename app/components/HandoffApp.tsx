"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/session";
import { fetchReadiness, streamSpecPack } from "@/lib/api";
import { FeatureStep } from "./FeatureStep";
import { ReadinessStep } from "./ReadinessStep";
import { SpecPackStep } from "./SpecPackStep";
import { HistoryList } from "./HistoryList";
import { RepoPanel } from "./RepoPanel";
import { StepHeading, StepSummary } from "./ui";
import {
  deleteEntry,
  loadHistory,
  makeId,
  saveEntry,
  type HistoryEntry,
} from "@/lib/history";

const VERDICT_TEXT: Record<string, string> = {
  ready: "ready to hand off",
  "needs-work": "needs work",
  "not-ready": "not ready",
};

type Step = "feature" | "readiness" | "specpack";

export function HandoffApp() {
  const { session, update, reset, hydrated } = useSession();
  const [step, setStep] = useState<Step>("feature");
  const [resetNonce, setResetNonce] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specLoading, setSpecLoading] = useState(false);
  const [specError, setSpecError] = useState<string | null>(null);
  const [specProgress, setSpecProgress] = useState(0);
  const [specSlug, setSpecSlug] = useState("feature");
  const [demoMode, setDemoMode] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Demo mode is a per-viewer convenience — persist it in localStorage.
  useEffect(() => {
    try {
      setDemoMode(localStorage.getItem("handoff-demo") === "1");
    } catch {
      // ignore
    }
  }, []);

  function toggleDemo() {
    setDemoMode((on) => {
      const next = !on;
      try {
        localStorage.setItem("handoff-demo", next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  // On reload, resume at the furthest step the restored session reached —
  // once, so it never fights the user's own navigation.
  const resumed = useRef(false);
  useEffect(() => {
    if (!hydrated || resumed.current) return;
    resumed.current = true;
    if (session.specPack) {
      setStep("specpack");
      // Recover the slug from a file path like "specs/<slug>/intent.md".
      const parts = session.specPack.files[0]?.path.split("/");
      if (parts && parts.length >= 2) setSpecSlug(parts[parts.length - 2]);
    } else if (session.readiness) {
      setStep("readiness");
    }
  }, [hydrated, session.specPack, session.readiness]);

  // Wait for sessionStorage to hydrate before mounting the steps, so a
  // restored draft doesn't desync from the input's initial state.
  if (!hydrated) {
    return <div className="py-8 text-[13px] text-secondary">Loading…</div>;
  }

  async function runReadiness(feature: { title: string; text: string }) {
    setStep("readiness");
    setLoading(true);
    setError(null);
    try {
      const report = await fetchReadiness(feature, session.repo?.scan, demoMode);
      // Fresh report — clear any answers tied to the previous run's gap ids.
      update({ readiness: report, answers: [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function runSpecPack() {
    setStep("specpack");
    setSpecLoading(true);
    setSpecError(null);
    setSpecProgress(0);
    // Use the accepted revised Feature if there is one, else the original.
    const feature = session.featureRevised ?? session.feature;
    const gapLabels: Record<
      string,
      { question: string; owner: string; pillar: string }
    > = {};
    for (const g of session.readiness?.gaps ?? []) {
      gapLabels[g.id] = { question: g.question, owner: g.owner, pillar: g.pillar };
    }
    await streamSpecPack(
      { feature, answers: session.answers, gapLabels, repoScan: session.repo?.scan },
      {
        onProgress: (chars) => setSpecProgress(chars),
        onDone: (specPack, slug, cost) => {
          update({ specPack, costEstimate: cost, export: { mode: "files" } });
          setSpecSlug(slug);
          setSpecLoading(false);
          // Record the conversion so it can be reopened without re-analysis.
          setHistory(
            saveEntry({
              id: makeId(),
              title: feature.title || "Untitled feature",
              createdAt: new Date().toISOString(),
              slug,
              repoLabel: session.repo
                ? `${session.repo.owner}/${session.repo.repo}`
                : undefined,
              feature,
              readiness: session.readiness,
              answers: session.answers,
              specPack,
              costEstimate: cost,
              repo: session.repo,
            }),
          );
        },
        onError: (message) => {
          setSpecError(message);
          setSpecLoading(false);
        },
      },
      demoMode,
    );
  }

  function openEntry(e: HistoryEntry) {
    update((s) => ({
      ...s,
      feature: e.feature,
      readiness: e.readiness,
      answers: e.answers,
      specPack: e.specPack,
      costEstimate: e.costEstimate,
      repo: e.repo,
      featureRevised: undefined,
    }));
    setSpecSlug(e.slug);
    setSpecError(null);
    setSpecLoading(false);
    setStep("specpack");
  }

  const hasProgress = step !== "feature" || session.feature.text.length > 0;

  return (
    <div>
      <div className="flex justify-end pb-1">
        <button
          onClick={toggleDemo}
          title="Demo mode replays pre-captured responses instead of calling the model."
          className="text-[13px] text-secondary underline-offset-4 hover:text-foreground"
        >
          Demo mode{" "}
          <span className={demoMode ? "text-accent" : "text-secondary"}>
            {demoMode ? "on" : "off"}
          </span>
        </button>
      </div>

      <FeatureStep
        key={resetNonce}
        active={step === "feature"}
        onSubmit={runReadiness}
        onEdit={() => setStep("feature")}
      />

      {session.repo && (
        <RepoPanel
          owner={session.repo.owner}
          repo={session.repo.repo}
          scan={session.repo.scan}
        />
      )}

      {step === "feature" && (
        <HistoryList
          entries={history}
          onOpen={openEntry}
          onDelete={(id) => setHistory(deleteEntry(id))}
        />
      )}

      {step === "readiness" && (
        <>
          {loading && (
            <section className="py-8">
              <StepHeading>Readiness</StepHeading>
              <p className="mt-3 text-[15px] text-secondary">
                Reading the Feature the way a coding agent would…
              </p>
            </section>
          )}

          {!loading && error && (
            <section className="py-8">
              <StepHeading>Readiness</StepHeading>
              <p className="mt-3 text-[15px] text-warning">{error}</p>
              <button
                onClick={() => runReadiness(session.feature)}
                className="mt-3 text-[13px] text-accent underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </section>
          )}

          {!loading && !error && session.readiness && (
            <ReadinessStep report={session.readiness} onGenerate={runSpecPack} />
          )}
        </>
      )}

      {step === "specpack" && session.readiness && (
        <StepSummary
          label="Readiness"
          value={`Overall ${session.readiness.scores.overall} · ${
            VERDICT_TEXT[session.readiness.verdict] ?? session.readiness.verdict
          }`}
          onEdit={() => setStep("readiness")}
        />
      )}

      {step === "specpack" && (
        <>
          {specLoading && (
            <section className="py-8">
              <StepHeading>Spec pack</StepHeading>
              <p className="mt-3 text-[15px] text-secondary">
                Generating the five-file spec pack…
                {specProgress > 0
                  ? ` ${Math.round(specProgress / 1000)}k characters so far.`
                  : ""}
              </p>
            </section>
          )}

          {!specLoading && specError && (
            <section className="py-8">
              <StepHeading>Spec pack</StepHeading>
              <p className="mt-3 text-[15px] text-warning">{specError}</p>
              <button
                onClick={runSpecPack}
                className="mt-3 text-[13px] text-accent underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </section>
          )}

          {!specLoading && !specError && session.specPack && (
            <SpecPackStep
              specPack={session.specPack}
              slug={specSlug}
              cost={session.costEstimate}
              outcome={
                (session.featureRevised ?? session.feature).title || "This Feature"
              }
              onRegenerate={runSpecPack}
            />
          )}
        </>
      )}

      {hasProgress && (
        <div className="mt-10 border-t border-hairline pt-6">
          <button
            onClick={() => {
              reset();
              setStep("feature");
              setResetNonce((n) => n + 1);
              setError(null);
              setSpecError(null);
              setSpecLoading(false);
            }}
            className="text-[13px] text-secondary underline-offset-4 hover:underline"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
