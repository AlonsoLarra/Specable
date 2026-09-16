# Specable

**Make any feature agent-ready in minutes.**

Specable turns a feature written for humans into a spec pack a coding agent can build from — without guessing. Product Owners write features for people, and people ask questions in refinement. Coding agents don't ask; they guess, and you get "almost right" code. Specable reads a feature the way an agent would (literally, with no meeting to ask questions in), scores it, closes the gaps with the humans who own them, and exports a vendor-neutral spec pack.

**Live:** https://handoffapp-six.vercel.app

## What it does

1. **Feature** — paste a feature the way a Product Owner wrote it (or try a built-in example).
2. **Readiness** — scores it 0–100 on three pillars an agent needs before it can be trusted: **Intent** (why), **Specification** (what/how), and **Context** (where it fits). Every place an agent would guess becomes a gap you answer or log as an assumption. Intent gaps are never auto-answered — a human always owns the "why".
3. **Spec pack** — streams five vendor-neutral Markdown files (`constitution.md`, `intent.md`, `spec.md`, `plan.md`, `tasks.md`) that work with Claude Code, Copilot, Cursor, Kiro, or GitHub Spec Kit. Includes a criterion→task **trace** (unmapped criteria are flagged — that's what an agent silently skips) and a **token cost estimate**.
4. **Export** — download the pack as a zip, or copy it all.

**Connect a repo** (optional) to ground readiness and the spec pack in your real codebase: Specable reads the stack, conventions, and any existing constitution, and infers one if there isn't. Past conversions are saved locally so you can reopen a spec pack without re-running the analysis.

## Run locally (60 seconds)

```bash
git clone https://github.com/AlonsoLarra/Specable.git
cd Specable
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev                   # http://localhost:3000
```

You need an `ANTHROPIC_API_KEY` from the [Anthropic Console](https://console.anthropic.com/). The key is server-side only and never sent to the browser. **Demo mode** (toggle, top-right) replays pre-captured responses with no API call — handy for a quick look without a key.

## Cost model

Every spec pack includes a token cost estimate — the piece that ties to tracking agent token spend. For each task the pack proposes, the model returns how many files it will touch, average tokens per file, expected agent loop iterations (read → edit → test), and output tokens. Specable measures the real spec-pack context with Anthropic's free `count_tokens` endpoint (per the model you'd actually run — this matters because Claude 4.7+ models tokenize the same text into ~30% more tokens), then computes `perTaskInput = contextTokens + filesTouched × avgFileTokens × turns` and `perTaskOutput = outputTokens`, with a low/likely/high band of ×0.6 / ×1.0 / ×1.8. Costs are shown for Sonnet 5 and Opus 5. It's an estimate, clearly labeled: actual cost depends on the agent, retries, and how much of the codebase it reads — measure the first run and calibrate.

## Tech

Next.js (App Router) · TypeScript · Tailwind · `@anthropic-ai/sdk` with structured outputs (`zodOutputFormat`) · deployed on Vercel. No database, no auth — session state lives client-side (`sessionStorage`), history in `localStorage`. Readiness runs on Claude Sonnet 5, the spec pack streams on Sonnet 5 (Opus 5 via the `HANDOFF_SPEC_MODEL` env flag), and repo scans use Haiku 4.5. A connected repo's token is held in memory for the session only and is never stored or logged.

## How AI built this

Specable was built end-to-end with **Claude Code** (Claude Opus 4.8) in a single working session — scaffolding, the AI route handlers, the structured-output schemas and prompts, the UI, the cost model, and this README. Claude also drove the browser to verify each step live and captured the demo fixtures from its own running routes. The Anthropic SDK usage (structured outputs, `count_tokens`, prompt caching, model IDs) was written against Claude's own `claude-api` reference to avoid stale API patterns. All demo data is fictional.
