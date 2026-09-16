"use client";

import { useState } from "react";
import { useSession } from "@/lib/session";
import {
  corderoFeatureText,
  parseFeatureText,
  sampleFeatureText,
} from "@/lib/feature";
import { CORDERO_REPO_SCAN } from "@/lib/fixtures";
import { Button, StepHeading, StepSummary } from "./ui";

const PLACEHOLDER = `Title: Broker claim status portal

Benefit hypothesis: If brokers could check claim status themselves, support call volume would drop.

Acceptance criteria:
- A broker can sign in and see the claims they are assigned to
- Claim status reflects the latest state within 5 minutes`;

export function FeatureStep({
  active,
  onSubmit,
  onEdit,
}: {
  active: boolean;
  onSubmit: (feature: { title: string; text: string }) => void;
  onEdit: () => void;
}) {
  const { session, update } = useSession();
  const [draft, setDraft] = useState(() => {
    const f = session.feature;
    if (!f.text && !f.title) return "";
    return f.title ? `Title: ${f.title}\n\n${f.text}` : f.text;
  });

  if (!active) {
    const title = session.feature.title || "Feature";
    return (
      <StepSummary label="Feature" value={title} onEdit={onEdit} />
    );
  }

  const canSubmit = draft.trim().length > 0;

  function handleSubmit() {
    const parsed = parseFeatureText(draft);
    update({ feature: parsed });
    onSubmit(parsed);
  }

  return (
    <section className="py-8">
      <StepHeading>Feature</StepHeading>
      <p className="mt-2 text-[15px] text-secondary">
        Paste a Feature the way a Product Owner wrote it. Handoff reads it the
        way a coding agent would.
      </p>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={PLACEHOLDER}
        spellCheck={false}
        className="mt-5 h-72 w-full resize-y rounded-lg border border-hairline bg-white p-4 text-[15px] leading-relaxed text-foreground placeholder:text-secondary/70 focus:border-accent focus:outline-none"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[13px] text-secondary">
        <span>Paste a Feature, or try an example.</span>
        <span className="flex items-center gap-4">
          <button
            onClick={() => {
              setDraft(sampleFeatureText());
              update({ repo: undefined });
            }}
            className="text-accent underline-offset-4 hover:underline"
          >
            Vague sample
          </button>
          <button
            onClick={() => {
              setDraft(corderoFeatureText());
              // Connect the CorderoCoffee repo so the spec pack is repo-informed.
              update({
                repo: {
                  owner: "AlonsoLarra",
                  repo: "CorderoCoffee",
                  defaultBranch: "main",
                  token: "",
                  scan: CORDERO_REPO_SCAN,
                },
              });
            }}
            className="text-accent underline-offset-4 hover:underline"
          >
            CorderoCoffee + repo
          </button>
        </span>
      </div>

      <div className="mt-6">
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          Check readiness
        </Button>
      </div>
    </section>
  );
}
