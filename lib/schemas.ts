import { z } from "zod";

// Schemas for structured outputs. Rules from the brief §1 that bite:
// - every object gets additionalProperties:false (zodOutputFormat adds it)
// - mark every property required (no .optional()); required-first ordering makes
//   the output predictable and the API caps optional params at 24
// - no minLength/maximum constraints in the schema — put ranges in .describe()

export const GapSchema = z.object({
  id: z
    .string()
    .describe(
      "Stable id like 'intent-1', 'spec-2', 'context-1'. Referenced by the revised Feature's [NEEDS INPUT: id] markers.",
    ),
  pillar: z.enum(["intent", "specification", "context"]),
  severity: z
    .enum(["blocking", "important", "minor"])
    .describe(
      "blocking = a coding agent cannot proceed without guessing; important = it would build the wrong thing in a real way; minor = polish.",
    ),
  question: z
    .string()
    .describe("The exact question a coding agent would need answered."),
  whyItMatters: z
    .string()
    .describe("One sentence: what the agent would guess wrong without this."),
  owner: z
    .enum(["product", "domain-expert", "builder"])
    .describe(
      "Who should answer: product owns purpose/outcome/priority; domain-expert owns business rules/edge cases/regulatory; builder owns technical constraints/integration points.",
    ),
  suggestedAnswer: z
    .string()
    .describe(
      "A suggested answer clearly usable as a starting point, or empty string. ALWAYS empty for intent-pillar gaps — never invent the why.",
    ),
});

export const ReadinessReportSchema = z.object({
  scores: z
    .object({
      intent: z.number().describe("0–100. How well the 'why' is established."),
      specification: z
        .number()
        .describe("0–100. How well the 'what/how' is established."),
      context: z
        .number()
        .describe("0–100. How well the 'where it fits' is established."),
      overall: z.number().describe("0–100. Weighted overall readiness."),
    })
    .describe("Scores 0–100 for each pillar plus an overall."),
  verdict: z.enum(["ready", "needs-work", "not-ready"]),
  summary: z
    .string()
    .describe("Two sentences, plain language. No jargon, no framework quotes."),
  gaps: z
    .array(GapSchema)
    .describe(
      "Every place a coding agent would have to guess. Typically 3–8 for a vague Feature.",
    ),
  revisedFeature: z
    .object({
      title: z.string(),
      text: z
        .string()
        .describe(
          "The original Feature tightened, with a [NEEDS INPUT: gap-id] marker wherever a human must fill in. Never insert a placeholder value that looks real.",
        ),
    })
    .describe("Suggested rewrite of the Feature."),
});

export type ReadinessReportOut = z.infer<typeof ReadinessReportSchema>;

// --- Spec pack (brief §2.3, §4, §5) ---

export const SpecFileSchema = z.object({
  path: z
    .string()
    .describe(
      "Repo-relative path, e.g. 'specs/<slug>/intent.md'. Use exactly the five paths given in the instructions.",
    ),
  content: z.string().describe("Full Markdown content of the file."),
});

export const TraceRowSchema = z.object({
  criterionId: z.string().describe("Acceptance criterion id, e.g. 'AC-1'."),
  criterionText: z.string().describe("The criterion in one line."),
  taskIds: z
    .array(z.string())
    .describe(
      "Ids of the tasks that satisfy this criterion, e.g. ['T-1','T-3']. Empty only if genuinely unmapped.",
    ),
});

export const TaskEstimateSchema = z.object({
  taskId: z.string().describe("Task id, e.g. 'T-1'."),
  filesTouched: z
    .number()
    .describe("How many files the agent will read or edit for this task."),
  avgFileTokens: z
    .number()
    .describe("Average tokens per touched file; use 1500 if the repo is unknown."),
  turns: z
    .number()
    .describe("Expected agent loop iterations (read → edit → test), typically 2–6."),
  outputTokens: z
    .number()
    .describe("Tokens of code + explanation the agent will write for this task."),
});

export const SpecPackSchema = z.object({
  files: z
    .array(SpecFileSchema)
    .describe(
      "Exactly five files: constitution.md, intent.md, spec.md, plan.md, tasks.md — in that order.",
    ),
  trace: z
    .array(TraceRowSchema)
    .describe("One row per acceptance criterion, mapping it to the tasks that satisfy it."),
  taskEstimates: z
    .array(TaskEstimateSchema)
    .describe("One estimate per task in tasks.md, used to compute the cost table."),
});

export type SpecPackOut = z.infer<typeof SpecPackSchema>;

// --- Repo scan (brief §2.0) ---

export const RepoScanSchema = z.object({
  empty: z.boolean().describe("True if the repository has no commits yet."),
  stack: z
    .array(z.string())
    .describe('Detected stack, e.g. ["Next.js 15", "TypeScript", "Supabase"]. Empty if unknown.'),
  conventions: z
    .array(z.string())
    .describe(
      'Testing, lint, folder layout, commit style — each line ending with "(found)" or "(inferred)".',
    ),
  constitution: z.object({
    source: z.enum(["found", "inferred"]),
    path: z
      .string()
      .describe('Repo path if a constitution file was found, else "".'),
    markdown: z
      .string()
      .describe(
        "If found: the file content verbatim. If inferred: a constitution in the standard template, every inferred rule suffixed ' (inferred — confirm)'.",
      ),
  }),
  specDir: z.object({
    source: z.enum(["found", "proposed"]),
    path: z
      .string()
      .describe('Where the spec pack will be written, e.g. "specs".'),
  }),
  existingSpecs: z
    .array(
      z.object({
        path: z.string(),
        title: z.string(),
        summary: z.string(),
      }),
    )
    .describe("Existing spec files found in the repo. Empty if none."),
});

export type RepoScanOut = z.infer<typeof RepoScanSchema>;
