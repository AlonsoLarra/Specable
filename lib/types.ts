// Single source of truth for the Handoff flow (brief §2).
// Every step reads from and writes to a HandoffSession. No step reaches into
// another step's UI.

export type Pillar = "intent" | "specification" | "context";
export type Severity = "blocking" | "important" | "minor";
export type Owner = "product" | "domain-expert" | "builder";

export type RepoScan = {
  empty: boolean;
  stack: string[]; // e.g. ["Next.js 15", "TypeScript", "Supabase"]
  conventions: string[]; // each tagged "found" or "inferred" in its text
  constitution: {
    source: "found" | "inferred";
    path?: string;
    markdown: string;
  };
  specDir: { source: "found" | "proposed"; path: string };
  existingSpecs: Array<{ path: string; title: string; summary: string }>;
};

export type Gap = {
  id: string;
  pillar: Pillar;
  severity: Severity;
  question: string; // the exact question a coding agent would need answered
  whyItMatters: string; // one sentence: what the agent would guess wrong
  owner: Owner; // AI-Native Team capability that should answer
  suggestedAnswer: string; // "" if the model should not guess (always "" for intent)
};

export type ReadinessReport = {
  scores: {
    intent: number;
    specification: number;
    context: number;
    overall: number;
  }; // 0–100
  verdict: "ready" | "needs-work" | "not-ready";
  summary: string; // two sentences, plain language
  gaps: Gap[];
  revisedFeature: { title: string; text: string }; // rewrite with [NEEDS INPUT: gap-id] markers
};

export type Answer = {
  gapId: string;
  answer: string;
  kind: "answer" | "assumption";
};

// --- Spec pack (brief §2.3 / §4) ---

export type SpecFile = { path: string; content: string };

export type TaskEstimate = {
  taskId: string;
  filesTouched: number;
  avgFileTokens: number;
  turns: number;
  outputTokens: number;
};

export type TraceRow = {
  criterionId: string;
  criterionText: string;
  taskIds: string[];
};

export type SpecPack = {
  mode: "create" | "modify";
  files: SpecFile[];
  trace: TraceRow[];
  taskEstimates: TaskEstimate[];
};

// --- Cost estimate (brief §5) ---

export type ModelCost = { model: string; inputUsd: number; outputUsd: number };

export type CostEstimate = {
  contextTokens: number; // measured with count_tokens
  measuredWithModel: string;
  perTask: Array<{
    taskId: string;
    inputTokens: number;
    outputTokens: number;
  }>;
  totals: {
    low: { inputTokens: number; outputTokens: number };
    likely: { inputTokens: number; outputTokens: number };
    high: { inputTokens: number; outputTokens: number };
  };
  costs: ModelCost[]; // likely-total cost per model
  avgFileTokensSource: "measured" | "default";
};

export type HandoffSession = {
  feature: { title: string; text: string }; // raw, as pasted
  repo?: {
    owner: string;
    repo: string;
    defaultBranch: string;
    token: string; // memory only — never persisted or logged
    scan: RepoScan;
  };
  readiness?: ReadinessReport;
  featureRevised?: { title: string; text: string }; // accepted rewrite
  answers: Answer[];
  specPack?: SpecPack;
  costEstimate?: CostEstimate;
  export?: { mode: "files" | "pr"; prUrl?: string };
};

export function emptySession(): HandoffSession {
  return { feature: { title: "", text: "" }, answers: [] };
}
