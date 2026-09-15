"use client";

import { useMemo, useState } from "react";
import { useSession } from "@/lib/session";
import type { Gap, Owner, Pillar, ReadinessReport, Severity } from "@/lib/types";
import { Button, ScoreBar, StepHeading, Tag } from "./ui";

const PILLAR_LABEL: Record<Pillar, string> = {
  intent: "Intent",
  specification: "Specification",
  context: "Context",
};
const OWNER_LABEL: Record<Owner, string> = {
  product: "Product",
  "domain-expert": "Domain expert",
  builder: "Builder",
};
const VERDICT_LABEL: Record<ReadinessReport["verdict"], string> = {
  ready: "Ready to hand off",
  "needs-work": "Needs work before handoff",
  "not-ready": "Not ready to hand off",
};
const SEVERITY_ORDER: Severity[] = ["blocking", "important", "minor"];
const SEVERITY_LABEL: Record<Severity, string> = {
  blocking: "Blocking",
  important: "Important",
  minor: "Minor",
};

function GapRow({ gap }: { gap: Gap }) {
  const { session, update } = useSession();
  const existing = session.answers.find((a) => a.gapId === gap.id);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(existing?.answer ?? gap.suggestedAnswer);

  function save(kind: "answer" | "assumption") {
    const answer = draft.trim();
    if (!answer) return;
    update((s) => ({
      ...s,
      answers: [
        ...s.answers.filter((a) => a.gapId !== gap.id),
        { gapId: gap.id, answer, kind },
      ],
    }));
    setOpen(false);
  }

  function clear() {
    update((s) => ({
      ...s,
      answers: s.answers.filter((a) => a.gapId !== gap.id),
    }));
    setDraft(gap.suggestedAnswer);
  }

  // Answered gaps collapse to one line (§2.2).
  if (existing && !open) {
    return (
      <div className="flex items-baseline justify-between gap-4 py-3">
        <p className="min-w-0 text-[15px]">
          <span className="text-secondary">
            {existing.kind === "assumption" ? "Assumption · " : ""}
          </span>
          <span>{gap.question}</span>{" "}
          <span className="text-secondary">— {existing.answer}</span>
        </p>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 text-[13px] text-accent underline-offset-4 hover:underline"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center gap-2">
        <Tag tone={gap.severity === "blocking" ? "warning" : "muted"}>
          {PILLAR_LABEL[gap.pillar]}
        </Tag>
        <span className="text-secondary">·</span>
        <Tag>{OWNER_LABEL[gap.owner]}</Tag>
      </div>
      <p className="mt-1.5 text-[15px]">{gap.question}</p>
      <p className="mt-1 text-[13px] text-secondary">{gap.whyItMatters}</p>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={2}
        placeholder={
          gap.pillar === "intent"
            ? "Only a human can answer this one."
            : "Answer, or edit the suggestion…"
        }
        className="mt-3 w-full resize-y rounded-lg border border-hairline bg-white p-3 text-[15px] leading-relaxed placeholder:text-secondary/70 focus:border-accent focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-4">
        <Button onClick={() => save("answer")} disabled={!draft.trim()}>
          Answer
        </Button>
        <button
          onClick={() => save("assumption")}
          disabled={!draft.trim()}
          className="text-[13px] text-foreground underline-offset-4 hover:underline disabled:text-secondary"
        >
          Log as assumption
        </button>
        {existing && (
          <button
            onClick={clear}
            className="text-[13px] text-secondary underline-offset-4 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export function ReadinessStep({
  report,
  onGenerate,
}: {
  report: ReadinessReport;
  onGenerate: () => void;
}) {
  const { session, update } = useSession();
  const [revised, setRevised] = useState(
    () =>
      session.featureRevised?.text ??
      report.revisedFeature.text,
  );
  const [usedRevision, setUsedRevision] = useState(!!session.featureRevised);

  const grouped = useMemo(() => {
    return SEVERITY_ORDER.map((sev) => ({
      severity: sev,
      gaps: report.gaps.filter((g) => g.severity === sev),
    })).filter((g) => g.gaps.length > 0);
  }, [report.gaps]);

  const blockingIds = report.gaps
    .filter((g) => g.severity === "blocking")
    .map((g) => g.id);
  const answeredIds = new Set(session.answers.map((a) => a.gapId));
  const blockingResolved = blockingIds.filter((id) => answeredIds.has(id));
  const canGenerate = blockingIds.every((id) => answeredIds.has(id));

  return (
    <section className="py-8">
      <StepHeading>Readiness</StepHeading>

      <div className="mt-5 space-y-2">
        <ScoreBar label="Intent" value={report.scores.intent} />
        <ScoreBar label="Specification" value={report.scores.specification} />
        <ScoreBar label="Context" value={report.scores.context} />
        <div className="pt-1">
          <ScoreBar label="Overall" value={report.scores.overall} />
        </div>
      </div>

      <p className="mt-5 text-[15px]">
        <span
          className={
            report.verdict === "ready" ? "text-accent" : "text-warning"
          }
        >
          {VERDICT_LABEL[report.verdict]}.
        </span>{" "}
        <span className="text-secondary">{report.summary}</span>
      </p>

      <div className="mt-8">
        {grouped.map((group) => (
          <div key={group.severity} className="mb-6">
            <h3
              className={`text-[13px] ${
                group.severity === "blocking"
                  ? "text-warning"
                  : "text-secondary"
              }`}
            >
              {SEVERITY_LABEL[group.severity]}
            </h3>
            <div className="mt-1 divide-y divide-hairline border-t border-hairline">
              {group.gaps.map((gap) => (
                <GapRow key={gap.id} gap={gap} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="text-[13px] text-secondary">Revised Feature</h3>
        <textarea
          value={revised}
          onChange={(e) => {
            setRevised(e.target.value);
            setUsedRevision(false);
          }}
          rows={8}
          className="mt-2 w-full resize-y rounded-lg border border-hairline bg-white p-4 font-mono text-[13px] leading-relaxed focus:border-accent focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={() => {
              update({
                featureRevised: {
                  title: report.revisedFeature.title,
                  text: revised,
                },
              });
              setUsedRevision(true);
            }}
            className="text-[13px] text-foreground underline-offset-4 hover:underline"
          >
            Use this version
          </button>
          {usedRevision && (
            <span className="text-[13px] text-accent">Using revised Feature</span>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-hairline pt-6">
        <Button onClick={onGenerate} disabled={!canGenerate}>
          Generate spec pack
        </Button>
        <p className="mt-2 text-[13px] text-secondary">
          {canGenerate
            ? "Every blocking gap has an answer or a logged assumption."
            : `Answer or log an assumption for every blocking gap first (${blockingResolved.length}/${blockingIds.length}).`}
        </p>
      </div>
    </section>
  );
}
