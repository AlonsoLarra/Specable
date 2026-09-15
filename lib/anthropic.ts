import Anthropic from "@anthropic-ai/sdk";

// Server-side only. The key comes from ANTHROPIC_API_KEY in the environment and
// is never exposed to the client.
export const anthropic = new Anthropic();

// Models are pinned by the brief (§1). Sonnet 5 for readiness and the spec pack
// by default; Opus 5 for the spec pack via a flag if quality needs it; Haiku for
// the cheap repo-classification calls.
export const MODELS = {
  readiness: "claude-sonnet-5",
  specPack: process.env.HANDOFF_SPEC_MODEL || "claude-sonnet-5",
  repo: "claude-haiku-4-5",
} as const;
