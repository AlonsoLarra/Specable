import type { CostEstimate, SpecFile, TaskEstimate } from "./types";

// USD per million tokens (Anthropic list prices; verify before demo). Brief §5.
export const RATES: Record<string, { in: number; out: number }> = {
  "claude-haiku-4-5": { in: 1, out: 5 },
  "claude-sonnet-5": { in: 2, out: 10 },
  "claude-opus-5": { in: 5, out: 25 },
};

// Models shown as columns in the cost table.
export const COST_MODELS = ["claude-sonnet-5", "claude-opus-5"] as const;
export const MODEL_LABEL: Record<string, string> = {
  "claude-haiku-4-5": "Haiku 4.5",
  "claude-sonnet-5": "Sonnet 5",
  "claude-opus-5": "Opus 5",
};

// Rough token count when count_tokens isn't available (demo mode, offline).
// ~4 chars/token is a deliberate approximation; the real path measures instead.
export function approxTokens(text: string): number {
  return Math.round(text.length / 4);
}

export function approxContextTokens(files: SpecFile[]): number {
  return approxTokens(files.map((f) => f.content).join("\n"));
}

// Cost of a token count on a given model, in USD.
function dollars(inputTokens: number, outputTokens: number, model: string) {
  const r = RATES[model] ?? RATES["claude-sonnet-5"];
  return (inputTokens / 1e6) * r.in + (outputTokens / 1e6) * r.out;
}

// Compute the estimate from the per-task heuristics plus a measured (or
// approximated) context-token count. Brief §5:
//   perTaskInput  = contextTokens + filesTouched × avgFileTokens × turns
//   perTaskOutput = outputTokens
//   low / likely / high = totals × 0.6 / 1.0 / 1.8
export function computeCostEstimate(params: {
  taskEstimates: TaskEstimate[];
  contextTokens: number;
  measuredWithModel: string;
  avgFileTokensSource: "measured" | "default";
}): CostEstimate {
  const { taskEstimates, contextTokens, measuredWithModel, avgFileTokensSource } =
    params;

  const perTask = taskEstimates.map((t) => ({
    taskId: t.taskId,
    inputTokens: Math.round(
      contextTokens + t.filesTouched * t.avgFileTokens * t.turns,
    ),
    outputTokens: Math.round(t.outputTokens),
  }));

  const likelyIn = perTask.reduce((n, t) => n + t.inputTokens, 0);
  const likelyOut = perTask.reduce((n, t) => n + t.outputTokens, 0);
  const scale = (n: number, f: number) => Math.round(n * f);

  return {
    contextTokens,
    measuredWithModel,
    avgFileTokensSource,
    perTask,
    totals: {
      low: { inputTokens: scale(likelyIn, 0.6), outputTokens: scale(likelyOut, 0.6) },
      likely: { inputTokens: likelyIn, outputTokens: likelyOut },
      high: { inputTokens: scale(likelyIn, 1.8), outputTokens: scale(likelyOut, 1.8) },
    },
    costs: COST_MODELS.map((m) => ({
      model: m,
      inputUsd: (likelyIn / 1e6) * RATES[m].in,
      outputUsd: (likelyOut / 1e6) * RATES[m].out,
    })),
  };
}

export function taskCostUsd(
  task: { inputTokens: number; outputTokens: number },
  model: string,
): number {
  return dollars(task.inputTokens, task.outputTokens, model);
}

export function usd(n: number): string {
  return n < 0.1 ? `$${n.toFixed(3)}` : `$${n.toFixed(2)}`;
}

export function fmtTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

// Renders the "## Estimated execution cost" section for plan.md. The server
// swaps this in for the model's rough section (it's the last heading, so the
// replacement is a clean cut from the heading to end of file).
export function costSectionMarkdown(est: CostEstimate): string {
  const lines: string[] = [];
  lines.push("## Estimated execution cost");
  lines.push("");
  lines.push(
    "| Task | Tokens (likely) | Cost on Sonnet 5 | Cost on Opus 5 |",
  );
  lines.push("| --- | --- | --- | --- |");
  for (const t of est.perTask) {
    const total = t.inputTokens + t.outputTokens;
    lines.push(
      `| ${t.taskId} | ${fmtTokens(total)} | ${usd(taskCostUsd(t, "claude-sonnet-5"))} | ${usd(taskCostUsd(t, "claude-opus-5"))} |`,
    );
  }
  const likelyTotal = est.totals.likely.inputTokens + est.totals.likely.outputTokens;
  const lowTotal = est.totals.low.inputTokens + est.totals.low.outputTokens;
  const highTotal = est.totals.high.inputTokens + est.totals.high.outputTokens;
  const sonnet = est.costs.find((c) => c.model === "claude-sonnet-5");
  const opus = est.costs.find((c) => c.model === "claude-opus-5");
  const sonnetTotal = sonnet ? sonnet.inputUsd + sonnet.outputUsd : 0;
  const opusTotal = opus ? opus.inputUsd + opus.outputUsd : 0;
  lines.push(
    `| **Total (likely)** | ${fmtTokens(likelyTotal)} | ${usd(sonnetTotal)} | ${usd(opusTotal)} |`,
  );
  lines.push(
    `| Range (low–high) | ${fmtTokens(lowTotal)}–${fmtTokens(highTotal)} | ${usd(sonnetTotal * 0.6)}–${usd(sonnetTotal * 1.8)} | ${usd(opusTotal * 0.6)}–${usd(opusTotal * 1.8)} |`,
  );
  lines.push("");
  const measured =
    est.avgFileTokensSource === "measured"
      ? "Context size was measured with count_tokens"
      : `Context size was measured with count_tokens (${est.contextTokens.toLocaleString()} tokens); per-file size uses a 1,500-token default because no repository was sampled`;
  lines.push(
    `Estimate assumes an agent loop of read → edit → test. ${measured}. Actual cost depends on the agent, retries, and how much of the codebase it reads. Measure the first run and calibrate.`,
  );
  return lines.join("\n");
}

// Replace plan.md's cost section (the last heading) with the computed one.
export function injectCostIntoPlan(planMarkdown: string, est: CostEstimate): string {
  const idx = planMarkdown.indexOf("## Estimated execution cost");
  const body = costSectionMarkdown(est);
  if (idx === -1) return `${planMarkdown.trimEnd()}\n\n${body}\n`;
  return `${planMarkdown.slice(0, idx).trimEnd()}\n\n${body}\n`;
}
