// Markdown templates (brief §4). Headings are fixed so downstream tools (Spec
// Kit, etc.) can find sections. The model fills these exactly.

export const CONSTITUTION_TEMPLATE = `# Project constitution
Source: found at <path> | inferred from repository — confirm before relying on it

## Stack
## Code conventions
## Testing rules
## Definition of done
## Things an agent must never do`;

export const INTENT_TEMPLATE = `# Intent: <feature title>
## Outcome this serves
## Problem we are solving (and for whom)
## Why now
## What we are deliberately not doing
## Decision log
| Gap | Owner | Resolution | Kind (answer / assumption) |`;

export const SPEC_TEMPLATE = `# Specification: <feature title>
## User stories
## Acceptance criteria   (each as AC-1, AC-2 … in Given / When / Then)
## Non-functional requirements
## Out of scope
## Open assumptions   (mirrors the assumptions in intent.md; the agent must not silently resolve these)`;

export const PLAN_TEMPLATE = `# Implementation plan: <feature title>
## Approach
## Files and modules to touch
## Sequence
## Risks
## Estimated execution cost   (table plus one paragraph on how it was estimated)`;

export const TASKS_TEMPLATE = `# Tasks: <feature title>
- [ ] T-1 <task> — satisfies AC-1, AC-3 — est. ~<n>k tokens`;

// The exact paths the pack writes to. specDir defaults to "specs" and is
// overridden by a connected repo's scan.
export function packPaths(slug: string, specDir = "specs") {
  const base = `${specDir}/${slug}`;
  return {
    constitution: `${base}/constitution.md`,
    intent: `${base}/intent.md`,
    spec: `${base}/spec.md`,
    plan: `${base}/plan.md`,
    tasks: `${base}/tasks.md`,
  };
}

// A url-safe slug from the feature title.
export function slugify(title: string): string {
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s || "feature";
}
