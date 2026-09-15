"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/session";
import { fetchReadiness, streamSpecPack } from "@/lib/api";
import { FeatureStep } from "./FeatureStep";
import { ReadinessStep } from "./ReadinessStep";
import { SpecPackStep } from "./SpecPackStep";
import { StepHeading, StepSummary } from "./ui";

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
      const report = await fetchReadiness(feature, session.repo?.scan);
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
        onDone: (specPack, slug) => {
          update({ specPack, export: { mode: "files" } });
          setSpecSlug(slug);
          setSpecLoading(false);
        },
        onError: (message) => {
          setSpecError(message);
          setSpecLoading(false);
        },
      },
    );
  }

  const hasProgress = step !== "feature" || session.feature.text.length > 0;

  return (
    <div>
      <FeatureStep
        key={resetNonce}
        active={step === "feature"}
        onSubmit={runReadiness}
        onEdit={() => setStep("feature")}
      />

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
