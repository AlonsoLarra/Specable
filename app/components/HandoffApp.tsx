"use client";

import { useState } from "react";
import { useSession } from "@/lib/session";
import { fetchReadiness } from "@/lib/api";
import { FeatureStep } from "./FeatureStep";
import { ReadinessStep } from "./ReadinessStep";
import { StepHeading } from "./ui";

type Step = "feature" | "readiness" | "specpack";

export function HandoffApp() {
  const { session, update, reset, hydrated } = useSession();
  const [step, setStep] = useState<Step>("feature");
  const [resetNonce, setResetNonce] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            <ReadinessStep
              report={session.readiness}
              onGenerate={() => setStep("specpack")}
            />
          )}
        </>
      )}

      {step === "specpack" && (
        <section className="py-8">
          <StepHeading>Spec pack</StepHeading>
          <p className="mt-2 text-[15px] text-secondary">
            Handoff will generate the five-file spec pack — intent, spec, plan,
            tasks, and constitution — with a criterion-to-task trace and a token
            cost estimate.
          </p>
          <p className="mt-6 text-[13px] text-secondary">
            Generation route wiring next.
          </p>
        </section>
      )}

      {hasProgress && (
        <div className="mt-10 border-t border-hairline pt-6">
          <button
            onClick={() => {
              reset();
              setStep("feature");
              setResetNonce((n) => n + 1);
              setError(null);
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
