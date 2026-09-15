"use client";

import { useState } from "react";
import { useSession } from "@/lib/session";
import { FeatureStep } from "./FeatureStep";
import { StepHeading } from "./ui";

type Step = "feature" | "readiness";

export function HandoffApp() {
  const { session, reset, hydrated } = useSession();
  const [step, setStep] = useState<Step>("feature");
  const [resetNonce, setResetNonce] = useState(0);

  // Wait for sessionStorage to hydrate before mounting the steps, so a
  // restored draft doesn't desync from the input's initial state.
  if (!hydrated) {
    return <div className="py-8 text-[13px] text-secondary">Loading…</div>;
  }

  const hasProgress = step !== "feature" || session.feature.text.length > 0;

  return (
    <div>
      <FeatureStep
        key={resetNonce}
        active={step === "feature"}
        onSubmit={() => setStep("readiness")}
        onEdit={() => setStep("feature")}
      />

      {step === "readiness" && (
        <section className="py-8">
          <StepHeading>Readiness</StepHeading>
          <p className="mt-2 text-[15px] text-secondary">
            Handoff will score this Feature against Intent, Specifications, and
            Context, then surface the gaps a coding agent would otherwise guess
            at.
          </p>
          <p className="mt-6 text-[13px] text-secondary">
            Analysis route wiring next.
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
