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
