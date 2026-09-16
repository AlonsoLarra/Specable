import type { ReadinessReport, RepoScan, SpecPack } from "./types";

// Pre-captured real responses for demo mode (no Anthropic call). Two scenarios:
// the vague Meridian sample (no repo) and the CorderoCoffee loyalty Feature run
// against a real scan of the AlonsoLarra/CorderoCoffee repo. Regenerate by
// re-capturing the route outputs if the schemas change.

export type DemoScenario = {
  readiness: ReadinessReport;
  specPack: SpecPack;
  slug: string;
  repo?: { owner: string; repo: string; defaultBranch: string; scan: RepoScan };
};

export const DEMO_SAMPLE: DemoScenario = {
  slug: "let-brokers-see-claim-status-online",
  readiness: {
  "scores": {
    "intent": 50,
    "specification": 25,
    "context": 20,
    "overall": 32
  },
  "verdict": "not-ready",
  "summary": "This Feature captures a plausible business motivation but leaves nearly everything an agent would need to build it undefined — which claims, which system, what 'up to date' means, and what legal restrictions actually are. It reads like a one-paragraph idea, not a buildable spec.",
  "gaps": [
    {
      "id": "context-1",
      "pillar": "context",
      "severity": "blocking",
      "question": "Which codebase/repository, claims system, and portal login service should this feature be built against?",
      "whyItMatters": "Without a connected repository or named system, the agent cannot know the existing architecture, data models, or login mechanism to integrate with.",
      "owner": "builder",
      "suggestedAnswer": ""
    },
    {
      "id": "intent-1",
      "pillar": "intent",
      "severity": "important",
      "question": "What outcome are we optimizing for — fewer support calls, faster broker resolution, broker satisfaction — and how will success be measured?",
      "whyItMatters": "Without a measurable goal, the agent may build a minimal status page that technically works but doesn't reduce calls.",
      "owner": "product",
      "suggestedAnswer": ""
    },
    {
      "id": "intent-2",
      "pillar": "intent",
      "severity": "minor",
      "question": "Is there anything explicitly out of scope, such as claim documents, payment details, or adjuster notes?",
      "whyItMatters": "Without stated exclusions, the agent may over-build or under-build the visible claim data.",
      "owner": "product",
      "suggestedAnswer": ""
    },
    {
      "id": "spec-1",
      "pillar": "specification",
      "severity": "blocking",
      "question": "What are the exact claim statuses and their definitions, and how is 'up to date' defined (real-time, hourly sync, nightly batch)?",
      "whyItMatters": "Without this, the agent will guess arbitrary status values and a refresh cadence that may not match the real claims system.",
      "owner": "domain-expert",
      "suggestedAnswer": "Use the existing claim status enum from the core claims system, synced in near real-time (e.g. on each claims-system update webhook)."
    },
    {
      "id": "spec-2",
      "pillar": "specification",
      "severity": "blocking",
      "question": "What does 'works on mobile' mean — a responsive web view, or a native app requirement?",
      "whyItMatters": "This changes the entire technical approach, from CSS breakpoints to a separate app build.",
      "owner": "product",
      "suggestedAnswer": "Responsive web layout that works in mobile browsers, no native app."
    },
    {
      "id": "spec-3",
      "pillar": "specification",
      "severity": "important",
      "question": "What are the concrete acceptance tests (Given/When/Then) for broker login, viewing claims list, and viewing individual claim status?",
      "whyItMatters": "Without testable criteria the agent cannot verify it built the right authorization and display behavior.",
      "owner": "product",
      "suggestedAnswer": ""
    },
    {
      "id": "context-2",
      "pillar": "context",
      "severity": "blocking",
      "question": "What exactly are the legal/compliance restrictions on what data brokers can see per claim?",
      "whyItMatters": "Without explicit rules, the agent could expose sensitive claim data (e.g. medical details, payout amounts) that legal wants hidden.",
      "owner": "domain-expert",
      "suggestedAnswer": ""
    },
    {
      "id": "context-3",
      "pillar": "context",
      "severity": "important",
      "question": "Should a broker only see their own submitted claims, or all claims tied to their agency/book of business?",
      "whyItMatters": "This determines the authorization and data-filtering logic; guessing wrong could leak other brokers' claims.",
      "owner": "domain-expert",
      "suggestedAnswer": ""
    }
  ],
  "revisedFeature": {
    "title": "Let brokers view claim status online",
    "text": "Benefit hypothesis: Brokers currently call in to ask about claim status, creating support load. Enabling brokers to view claim status online should reduce these calls.\n\nGoal / success metric: [NEEDS INPUT: intent-1]\n\nOut of scope: [NEEDS INPUT: intent-2]\n\nContext:\n- System/repository to build against: [NEEDS INPUT: context-1]\n- Login: reuse existing portal login (to be confirmed against the connected system)\n- Data visibility rules per broker: [NEEDS INPUT: context-3]\n- Legal/compliance restrictions on visible claim fields: [NEEDS INPUT: context-2]\n\nAcceptance criteria:\n- Broker can log in via the existing portal login and see a list of their claims, scoped per [NEEDS INPUT: context-3]\n- Each claim shows a status value drawn from [NEEDS INPUT: spec-1], updated per the sync cadence defined there\n- Layout is responsive and usable on mobile browsers per [NEEDS INPUT: spec-2]\n- Detailed Given/When/Then test cases: [NEEDS INPUT: spec-3]\n\nCompliance: No claim data restricted per [NEEDS INPUT: context-2] shall be displayed to brokers."
  }
},
  specPack: {
  "mode": "create",
  "files": [
    {
      "path": "specs/let-brokers-see-claim-status-online/constitution.md",
      "content": "# Project constitution\nSource: inferred from repository — confirm before relying on it\n\n## Stack\n- Next.js + TypeScript for the broker portal (inferred — confirm)\n- Meridian Claims Service REST API as the sole source of claim data (inferred — confirm)\n- Session-based authentication provided by the existing portal login (inferred — confirm)\n\n## Code conventions\n- TypeScript strict mode, functional React components (inferred — confirm)\n- API access isolated in a dedicated service/client module, not called directly from components (inferred — confirm)\n- Naming follows existing portal folder conventions (features/<name>) (inferred — confirm)\n\n## Testing rules\n- Unit tests for any new data-shaping/authorization logic (inferred — confirm)\n- Integration test covering an authenticated broker fetching only their agency's claims (inferred — confirm)\n- No merging without passing CI (inferred — confirm)\n\n## Definition of done\n- Feature builds, lints, and passes tests in CI (inferred — confirm)\n- Acceptance criteria verified manually or via test (inferred — confirm)\n- No sensitive fields (reserve amounts, adjuster notes, litigation flags, other agencies' data) present in any response payload (inferred — confirm)\n\n## Things an agent must never do\n- Never call the claims database directly, bypassing the Claims Service API (inferred — confirm)\n- Never expose data belonging to another agency (inferred — confirm)\n- Never return restricted fields (reserve amounts, adjuster notes, litigation flags) to the client (inferred — confirm)\n- Never invent claim statuses outside the approved set (inferred — confirm)\n"
    },
    {
      "path": "specs/let-brokers-see-claim-status-online/intent.md",
      "content": "# Intent: Let brokers see claim status online\n\n## Outcome this serves\nReduce broker-support call volume and broker friction by letting brokers self-serve claim status for their own agency directly in the Meridian broker portal.\n\n## Problem we are solving (and for whom)\nBrokers currently must call support to ask about the status of claims filed for their agency. This wastes broker time and consumes support capacity. Brokers need a fast, self-service way to check status.\n\n## Why now\nSupport call volume tied to \"what's the status of this claim\" is a recurring, avoidable cost, and the portal already has an authenticated broker session to build on.\n\n## What we are deliberately not doing\n- Not building a native mobile app.\n- Not exposing reserve amounts, adjuster notes, litigation flags, or other parties' claim data.\n- Not building a new login/authentication system.\n- Not giving brokers visibility into other agencies' claims.\n\n## Decision log\n| Gap | Owner | Resolution | Kind (answer / assumption) |\n|---|---|---|---|\n| Which codebase, claims system, and login service? | builder | Build inside the existing Meridian broker portal (Next.js + TypeScript), reuse existing session-based sign-in, read claims from the Meridian Claims Service REST API keyed by agency id, no direct DB access | answer |\n| Exact claim statuses and definition of up to date? | domain-expert | Status set: Received, In review, Awaiting information, Approved, Denied, Paid, Closed. Up to date = reflects the source within 5 minutes | answer |\n| What does works on mobile mean? | product | Responsive web within the existing portal; current Chrome and Safari on iOS and Android; no native app | answer |\n| Legal restrictions on visible data? | domain-expert | Brokers see only their own agency's claims, limited to claim reference, current status, last-updated, line of business; never reserve amounts, adjuster notes, litigation flags, or other parties' data; enforced at API layer | answer |\n"
    },
    {
      "path": "specs/let-brokers-see-claim-status-online/spec.md",
      "content": "# Specification: Let brokers see claim status online\n\n## User stories\n- As a broker, I want to sign in to the portal and see the status of my agency's claims, so that I don't need to call support.\n- As a broker, I want to see only the claim reference, current status, last-updated time, and line of business, so that I get what I need without exposure to sensitive internal data.\n- As a broker, I want to check claim status from my phone's browser, so that I can get answers while away from my desk.\n\n## Acceptance criteria\n- AC-1: Given a broker is signed into the portal, when they navigate to the claims status page, then they see a list of claims belonging only to their own agency.\n- AC-2: Given a claim is displayed, when the broker views it, then only claim reference, current status, last-updated, and line of business are shown — no reserve amounts, adjuster notes, litigation flags, or other restricted fields.\n- AC-3: Given a claim's status changes in the Claims Service, when up to 5 minutes have passed, then the portal reflects the updated status.\n- AC-4: Given a broker is signed in, when they view a claim, then the status shown is one of: Received, In review, Awaiting information, Approved, Denied, Paid, Closed.\n- AC-5: Given a broker attempts to view claims, when the request is made, then the API returns only claims for the broker's own agency, enforced server-side regardless of client input.\n- AC-6: Given a broker uses current Chrome or Safari on iOS or Android, when they open the claims status page, then the page renders and functions correctly in a responsive layout.\n- AC-7: Given a broker is not signed in, when they attempt to access the claims status page, then they are redirected to sign in and see no claim data.\n\n## Non-functional requirements\n- Claim status data must be no more than 5 minutes stale relative to the Claims Service source.\n- Authorization to view claims must be enforced at the API layer, not only in the UI.\n- Page must be responsive and functional on current Chrome and Safari on iOS and Android.\n- No sensitive fields (reserve amounts, adjuster notes, litigation flags, other-party data) may ever be included in API responses to brokers.\n- Reuse existing portal session-based authentication; no new auth mechanism.\n\n## Out of scope\n- Native mobile app.\n- Broker-initiated claim actions (e.g., submitting documents, disputing status).\n- Access to reserve amounts, adjuster notes, litigation flags, or other agencies'/parties' data.\n- New authentication or account-management system.\n\n## Open assumptions\n- None beyond the resolved gaps; all four gaps were resolved via direct human answers, not assumptions.\n"
    },
    {
      "path": "specs/let-brokers-see-claim-status-online/plan.md",
      "content": "# Implementation plan: Let brokers see claim status online\n\n## Approach\nAdd a new claims-status feature area within the existing Meridian broker portal (Next.js + TypeScript). Reuse the existing session-based authentication to identify the signed-in broker and their agency id. Add a server-side API route/service layer that calls the Meridian Claims Service REST API scoped by agency id, filters the response down to only the allowed fields (claim reference, current status, last-updated, line of business), and returns them to a responsive client page.\n\n## Files and modules to touch\n- New page/route for claims status (e.g., pages or app route for /claims or /broker/claims)\n- New server-side API handler/service module that calls the Meridian Claims Service and enforces field/agency filtering\n- New client component(s) rendering the claims list responsively\n- Shared types for the claim status model (allowed statuses and fields)\n- Auth/session guard integration to redirect unauthenticated users\n- Tests: unit tests for the filtering/authorization logic, integration test for the end-to-end fetch flow\n\n## Sequence\n1. Define shared claim status types and allowed field set.\n2. Build server-side service module calling the Claims Service API by agency id, filtering to allowed fields.\n3. Add authorization guard ensuring only the signed-in broker's own agency data can be requested/returned.\n4. Build the claims status page and responsive UI components consuming the service.\n5. Wire up sign-in redirect for unauthenticated access.\n6. Add unit and integration tests.\n7. Manual verification against acceptance criteria including mobile browsers.\n\n## Risks\n- Claims Service API may not natively support agency-scoped queries, requiring extra filtering logic.\n- Staleness requirement (5 minutes) may require caching strategy considerations.\n- Ensuring restricted fields never leak requires careful response shaping and testing.\n\n## Estimated execution cost\n| Task | Files touched | Avg tokens/file | Turns | Output tokens | Est. total tokens |\n|---|---|---|---|---|---|\n| T-1 | 2 | 1500 | 3 | 800 | ~5.8k |\n| T-2 | 3 | 1500 | 4 | 1200 | ~7.7k |\n| T-3 | 2 | 1500 | 3 | 700 | ~4.7k |\n| T-4 | 3 | 1500 | 4 | 1500 | ~8k |\n| T-5 | 2 | 1500 | 2 | 500 | ~3.5k |\n| T-6 | 3 | 1500 | 3 | 900 | ~5.9k |\n| **Total** | | | | | **~35.6k** |\n\nThis is a rough estimate meant to be calibrated against the first real run rather than treated as precise.\n"
    },
    {
      "path": "specs/let-brokers-see-claim-status-online/tasks.md",
      "content": "# Tasks: Let brokers see claim status online\n\n- [ ] T-1 Define shared claim status types and allowed field set (statuses, claim reference, current status, last-updated, line of business) — satisfies AC-2, AC-4 — est. ~6k tokens\n- [ ] T-2 Build server-side service module calling Meridian Claims Service API by agency id and filtering to allowed fields — satisfies AC-1, AC-2, AC-5 — est. ~8k tokens\n- [ ] T-3 Enforce agency-scoped authorization at the API layer regardless of client input — satisfies AC-1, AC-5 — est. ~5k tokens\n- [ ] T-4 Build responsive claims status page and UI components — satisfies AC-1, AC-2, AC-6 — est. ~8k tokens\n- [ ] T-5 Add sign-in redirect guard for unauthenticated access to the claims status page — satisfies AC-7 — est. ~4k tokens\n- [ ] T-6 Add unit and integration tests covering filtering, authorization, and freshness — satisfies AC-2, AC-3, AC-5 — est. ~6k tokens\n"
    }
  ],
  "trace": [
    {
      "criterionId": "AC-1",
      "criterionText": "Signed-in broker sees only their agency's claims list",
      "taskIds": [
        "T-2",
        "T-3",
        "T-4"
      ]
    },
    {
      "criterionId": "AC-2",
      "criterionText": "Only allowed fields shown, no restricted fields",
      "taskIds": [
        "T-1",
        "T-2",
        "T-4",
        "T-6"
      ]
    },
    {
      "criterionId": "AC-3",
      "criterionText": "Status reflects source within 5 minutes",
      "taskIds": [
        "T-6"
      ]
    },
    {
      "criterionId": "AC-4",
      "criterionText": "Status is one of the approved status set",
      "taskIds": [
        "T-1"
      ]
    },
    {
      "criterionId": "AC-5",
      "criterionText": "API enforces agency scoping server-side",
      "taskIds": [
        "T-2",
        "T-3",
        "T-6"
      ]
    },
    {
      "criterionId": "AC-6",
      "criterionText": "Responsive on current Chrome/Safari iOS/Android",
      "taskIds": [
        "T-4"
      ]
    },
    {
      "criterionId": "AC-7",
      "criterionText": "Unauthenticated users redirected, no data shown",
      "taskIds": [
        "T-5"
      ]
    }
  ],
  "taskEstimates": [
    {
      "taskId": "T-1",
      "filesTouched": 2,
      "avgFileTokens": 1500,
      "turns": 3,
      "outputTokens": 800
    },
    {
      "taskId": "T-2",
      "filesTouched": 3,
      "avgFileTokens": 1500,
      "turns": 4,
      "outputTokens": 1200
    },
    {
      "taskId": "T-3",
      "filesTouched": 2,
      "avgFileTokens": 1500,
      "turns": 3,
      "outputTokens": 700
    },
    {
      "taskId": "T-4",
      "filesTouched": 3,
      "avgFileTokens": 1500,
      "turns": 4,
      "outputTokens": 1500
    },
    {
      "taskId": "T-5",
      "filesTouched": 2,
      "avgFileTokens": 1500,
      "turns": 2,
      "outputTokens": 500
    },
    {
      "taskId": "T-6",
      "filesTouched": 3,
      "avgFileTokens": 1500,
      "turns": 3,
      "outputTokens": 900
    }
  ]
},
};

export const CORDERO_REPO_SCAN: RepoScan = {
  "empty": false,
  "stack": [
    "Next.js 14 (App Router)",
    "TypeScript",
    "Tailwind CSS",
    "Supabase (Auth + Postgres via @supabase/ssr)",
    "Stripe payments",
    "Upstash Redis (rate limiting)",
    "Capacitor (iOS app shell)",
    "Playwright (e2e)",
    "Vercel Analytics"
  ],
  "conventions": [
    "App Router under app/ with API route handlers (found)",
    "Auth and data via Supabase using @supabase/ssr; session handled in middleware.ts (found)",
    "Payments via Stripe (found)",
    "Rate limiting via Upstash Redis on sensitive routes (found)",
    "End-to-end tests with Playwright in e2e/ (found)",
    "TypeScript with eslint-config-next (found)",
    "iOS delivered as a Capacitor shell over the web app (found)",
    "Environment configured via .env.local from .env.example (found)"
  ],
  "constitution": {
    "source": "inferred",
    "markdown": "# Project constitution\nSource: inferred from repository — confirm before relying on it\n\n## Stack\n- Next.js 14 App Router + TypeScript + Tailwind (inferred — confirm)\n- Supabase for auth and Postgres data access via @supabase/ssr (inferred — confirm)\n- Stripe for payments; Upstash Redis for rate limiting (inferred — confirm)\n- iOS shipped as a Capacitor shell over the web app (inferred — confirm)\n\n## Code conventions\n- App Router routes and API handlers under app/ (inferred — confirm)\n- Session/auth enforced in middleware.ts (inferred — confirm)\n- Keep Supabase access in lib/ helpers, not inline in components (inferred — confirm)\n\n## Testing rules\n- End-to-end flows covered by Playwright in e2e/ (inferred — confirm)\n- New user-facing flows get at least one e2e happy-path test (inferred — confirm)\n\n## Definition of done\n- Builds, lints, and Playwright e2e pass (inferred — confirm)\n- Works in both the web app and the Capacitor iOS shell (inferred — confirm)\n\n## Things an agent must never do\n- Never expose Supabase service-role or Stripe secret keys to the client (inferred — confirm)\n- Never bypass middleware auth for member-only data (inferred — confirm)\n- Never trust client-supplied amounts or stamp counts (inferred — confirm)"
  },
  "specDir": {
    "source": "proposed",
    "path": "specs"
  },
  "existingSpecs": []
};

export const DEMO_CORDERO: DemoScenario = {
  slug: "digital-loyalty-card-for-cordero-coffee-club-mem",
  readiness: {
  "scores": {
    "intent": 55,
    "specification": 58,
    "context": 60,
    "overall": 58
  },
  "verdict": "needs-work",
  "summary": "The feature has a clear benefit hypothesis and basic acceptance criteria, but leaves key business rules, edge cases, and technical wiring undefined. A coding agent would have to guess how purchases are detected, how staff auth works, and what happens to expired or refunded purchases.",
  "gaps": [
    {
      "id": "context-1",
      "pillar": "context",
      "severity": "blocking",
      "question": "How does a 'completed, paid purchase' get recorded — is it a Stripe webhook, a POS integration, or a manual staff action in-app?",
      "whyItMatters": "Without knowing the trigger source, the agent cannot build the stamp-granting logic or know what event to listen to.",
      "owner": "builder",
      "suggestedAnswer": ""
    },
    {
      "id": "context-2",
      "pillar": "context",
      "severity": "blocking",
      "question": "Who is 'staff' and how do they authenticate to mark a reward redeemed — a separate staff role/login, or a PIN-based in-store device?",
      "whyItMatters": "The agent needs to know the auth model to build the redemption flow securely.",
      "owner": "builder",
      "suggestedAnswer": ""
    },
    {
      "id": "spec-1",
      "pillar": "specification",
      "severity": "blocking",
      "question": "What happens if a qualifying purchase is later refunded — is the stamp revoked, and if the reward was already redeemed, what happens?",
      "whyItMatters": "Without this the agent will not build any reversal logic, risking free drinks for refunded purchases.",
      "owner": "domain-expert",
      "suggestedAnswer": ""
    },
    {
      "id": "spec-2",
      "pillar": "specification",
      "severity": "important",
      "question": "Do rewards expire, or can a member accumulate multiple unredeemed rewards indefinitely?",
      "whyItMatters": "This affects the data model and UI for displaying rewards.",
      "owner": "product",
      "suggestedAnswer": "Assume rewards do not expire and multiple can stack until stated otherwise."
    },
    {
      "id": "spec-3",
      "pillar": "specification",
      "severity": "important",
      "question": "What exact mechanism prevents duplicate stamps from refreshes or replayed requests — idempotency key tied to Stripe payment intent, or something else?",
      "whyItMatters": "The note flags this risk but doesn't specify the dedupe mechanism the agent should implement.",
      "owner": "builder",
      "suggestedAnswer": "Use the Stripe payment intent ID as an idempotency key when granting a stamp."
    },
    {
      "id": "intent-1",
      "pillar": "intent",
      "severity": "important",
      "question": "Is there a target metric or timeframe for the 'come back more often' outcome, and is this feature prioritized over other loyalty mechanics?",
      "whyItMatters": "Without a success measure, the agent (and reviewers) can't judge whether scope choices serve the actual goal.",
      "owner": "product",
      "suggestedAnswer": ""
    },
    {
      "id": "spec-4",
      "pillar": "specification",
      "severity": "minor",
      "question": "What out-of-scope items exist besides retail coffee bags — e.g. discounted drinks, promo-code purchases, or catering orders?",
      "whyItMatters": "Ambiguous 'qualifying drink' definition could let the agent include or exclude items incorrectly.",
      "owner": "domain-expert",
      "suggestedAnswer": ""
    },
    {
      "id": "context-3",
      "pillar": "context",
      "severity": "minor",
      "question": "Should stamp/reward data sync in real time between web and iOS Capacitor shell, or is periodic refresh acceptable?",
      "whyItMatters": "Affects whether the agent needs realtime subscriptions (e.g. Supabase realtime) or simple polling.",
      "owner": "builder",
      "suggestedAnswer": "Use standard fetch-on-load; realtime not required unless specified."
    }
  ],
  "revisedFeature": {
    "title": "Digital loyalty card for Cordero Coffee Club members",
    "text": "Benefit hypothesis: Members come back more often if each purchase visibly moves them toward a free drink. [NEEDS INPUT: intent-1]\n\nMembers earn one stamp per qualifying drink purchase (any drink, excluding retail coffee bags — [NEEDS INPUT: spec-4] for further exclusions). After 9 stamps, members earn a free drink reward redeemable at pickup. Stamp count and rewards are visible in both the web app and iOS app ([NEEDS INPUT: context-3] for sync requirements).\n\nA stamp is granted only for a completed, paid purchase, triggered by [NEEDS INPUT: context-1]. Duplicate stamp grants from refreshes or replayed requests must be prevented via [NEEDS INPUT: spec-3].\n\nIf a qualifying purchase is refunded, [NEEDS INPUT: spec-1] describes how the stamp/reward should be adjusted.\n\nStaff can mark a reward redeemed at pickup, authenticated via [NEEDS INPUT: context-2]. Once redeemed, a reward cannot be reused.\n\nRewards behavior when unused: [NEEDS INPUT: spec-2].\n\nAcceptance criteria:\n- A signed-in member sees their current stamp count and any rewards\n- Completing a qualifying purchase adds exactly one stamp, deduplicated per purchase event\n- Reaching 9 stamps creates a redeemable free-drink reward and resets the counter\n- Staff can mark a reward redeemed at pickup, and it cannot be redeemed twice\n- A refunded qualifying purchase does not leave the member with an unearned stamp or reward"
  }
},
  specPack: {
  "mode": "create",
  "files": [
    {
      "path": "specs/digital-loyalty-card-for-cordero-coffee-club-mem/constitution.md",
      "content": "# Project constitution\nSource: inferred from repository — confirm before relying on it\n\n## Stack\n- Next.js 14 App Router + TypeScript + Tailwind (inferred — confirm)\n- Supabase for auth and Postgres data access via @supabase/ssr (inferred — confirm)\n- Stripe for payments; Upstash Redis for rate limiting (inferred — confirm)\n- iOS shipped as a Capacitor shell over the web app (inferred — confirm)\n\n## Code conventions\n- App Router routes and API handlers under app/ (inferred — confirm)\n- Session/auth enforced in middleware.ts (inferred — confirm)\n- Keep Supabase access in lib/ helpers, not inline in components (inferred — confirm)\n\n## Testing rules\n- End-to-end flows covered by Playwright in e2e/ (inferred — confirm)\n- New user-facing flows get at least one e2e happy-path test (inferred — confirm)\n\n## Definition of done\n- Builds, lints, and Playwright e2e pass (inferred — confirm)\n- Works in both the web app and the Capacitor iOS shell (inferred — confirm)\n\n## Things an agent must never do\n- Never expose Supabase service-role or Stripe secret keys to the client (inferred — confirm)\n- Never bypass middleware auth for member-only data (inferred — confirm)\n- Never trust client-supplied amounts or stamp counts (inferred — confirm)"
    },
    {
      "path": "specs/digital-loyalty-card-for-cordero-coffee-club-mem/intent.md",
      "content": "# Intent: Digital loyalty card for Cordero Coffee Club members\n\n## Outcome this serves\nIncrease repeat visits and perceived value for Cordero Coffee Club members by giving them a trustworthy, always-visible reward progress that they can check on web or iOS, without staff needing to manage anything but redemption.\n\n## Problem we are solving (and for whom)\nMembers currently have no reliable way to see how close they are to a free drink, and there is no tamper-proof way to grant stamps. We are solving this for paying club members (who need visible, accurate progress) and for staff (who need a simple, secure way to redeem a reward at pickup without a shared PIN or manual ledger).\n\n## Why now\nThe club is live on Stripe and Supabase already; adding stamp tracking closes an expectation gap between the loyalty promise and what the app actually shows, and doing it now avoids building a parallel, less secure system later.\n\n## What we are deliberately not doing\n- Not building a staff-facing manual stamp-adjustment UI beyond redemption and refund review logging.\n- Not supporting stamp transfers between members.\n- Not implementing tiered rewards beyond the 9-stamp free drink.\n\n## Decision log\n| Gap | Owner | Resolution | Kind (answer / assumption) |\n|---|---|---|---|\n| How is a completed paid purchase recorded? | builder | Stamp granted server-side from Stripe webhook (checkout.session.completed / payment_intent.succeeded), idempotent on Stripe event id | answer |\n| Who is staff and how do they authenticate? | builder | Staff authenticate via Supabase auth with a 'staff' role claim; redemption is a server action guarded by middleware checking the role, no shared PIN | answer |\n| What happens on refund? | domain-expert | If refunded before reward redemption, revoke the stamp via Stripe refund webhook; if already redeemed, do not claw back, log for staff review | answer |"
    },
    {
      "path": "specs/digital-loyalty-card-for-cordero-coffee-club-mem/spec.md",
      "content": "# Specification: Digital loyalty card for Cordero Coffee Club members\n\n## User stories\n- As a member, I want to see my current stamp count in the web app so I know my progress toward a free drink.\n- As a member, I want to see the same stamp count in the iOS app so my progress is consistent everywhere.\n- As a member, I want a stamp to be granted only when I actually pay for a qualifying drink, so the count reflects real purchases.\n- As staff, I want to redeem a member's free drink reward securely at pickup, so redemption can't be forged or duplicated.\n- As a member, I want my stamp revoked if my qualifying purchase is refunded before I redeem the reward, so the system stays fair.\n\n## Acceptance criteria\n- AC-1: Given a member completes and pays for a qualifying drink purchase via Stripe checkout, When the checkout.session.completed / payment_intent.succeeded webhook is received, Then exactly one stamp is granted to that member's account.\n- AC-2: Given the same Stripe event is delivered more than once (webhook replay), When it is processed again, Then no additional stamp is granted (idempotent on Stripe event id).\n- AC-3: Given a member has earned stamps, When they view the web app, Then their current stamp count is displayed accurately.\n- AC-4: Given a member has earned stamps, When they view the iOS app (Capacitor shell), Then the same stamp count is displayed as in the web app.\n- AC-5: Given a member reaches 9 stamps, When they view their card, Then a free drink reward is shown as available for redemption at pickup.\n- AC-6: Given a member has an available reward, When an authenticated staff user (with 'staff' role claim) redeems it via the server action, Then the reward is marked redeemed and cannot be redeemed again.\n- AC-7: Given a non-staff or unauthenticated user attempts to call the redemption action, When the request is made, Then it is rejected by middleware.\n- AC-8: Given a client attempts to grant a stamp directly (e.g., replaying or forging a request without a valid Stripe webhook event), When the request is processed, Then no stamp is granted.\n- AC-9: Given a qualifying purchase behind an unredeemed stamp is refunded, When the Stripe refund webhook is received, Then that stamp is revoked.\n- AC-10: Given a qualifying purchase behind an already-redeemed reward is refunded, When the Stripe refund webhook is received, Then the reward is not clawed back and the event is logged for staff review.\n\n## Non-functional requirements\n- Stamp-granting and redemption logic must run server-side only; client never determines or submits stamp counts.\n- Webhook processing must be idempotent on Stripe event id to survive retries/replays.\n- Redemption route must be rate-limited via Upstash Redis to prevent abuse.\n- Stamp count reads must be protected by Supabase auth middleware so members only see their own data.\n- Feature must work identically in the web app and the Capacitor iOS shell.\n- At least one Playwright e2e happy-path test covering purchase → stamp → redemption.\n\n## Out of scope\n- Manual staff stamp adjustments beyond refund-driven revocation and review logging.\n- Stamp transfers between members.\n- Tiered or multiple reward levels beyond the single 9-stamp free drink.\n\n## Open assumptions\n- None beyond the resolved answers above; all three gaps were resolved via explicit human answers, not assumptions."
    },
    {
      "path": "specs/digital-loyalty-card-for-cordero-coffee-club-mem/plan.md",
      "content": "# Implementation plan: Digital loyalty card for Cordero Coffee Club members\n\n## Approach\nGrant and revoke stamps exclusively via Stripe webhook handlers backed by Supabase Postgres, using the Stripe event id as an idempotency key. Expose stamp count and reward status through server-rendered/queried Supabase reads, protected by existing middleware. Redemption is a guarded server action requiring the 'staff' role claim and rate-limited via Upstash Redis. The same API/data layer serves both the Next.js web app and the Capacitor iOS shell, so no iOS-specific logic is needed beyond ensuring UI renders correctly in the shell.\n\n## Files and modules to touch\n- app/api/webhooks/stripe/route.ts — handle checkout/payment succeeded and refund events, idempotent stamp grant/revoke\n- lib/loyalty/stamps.ts — stamp grant/revoke/redeem logic against Supabase\n- lib/supabase/schema (migration) — stamps table, rewards table, stripe_event_id unique constraint\n- app/(member)/loyalty/page.tsx — display stamp count and reward status (web + iOS shell)\n- app/actions/redeem-reward.ts — server action for staff redemption, role-checked\n- middleware.ts — extend to guard redemption route/action and rate-limit via Upstash\n- e2e/loyalty.spec.ts — Playwright happy-path test\n\n## Sequence\n1. Add stamps/rewards schema and migrations in Supabase.\n2. Implement Stripe webhook handler for stamp grant with idempotency (AC-1, AC-2, AC-8).\n3. Implement Stripe refund webhook handling for revoke/log-for-review (AC-9, AC-10).\n4. Build member-facing stamp count and reward UI shared across web/iOS (AC-3, AC-4, AC-5).\n5. Implement staff redemption server action with role check and rate limiting (AC-6, AC-7).\n6. Add Playwright e2e happy-path test covering the full flow.\n\n## Risks\n- Webhook delivery order (payment succeeded vs refund) could race; must handle idempotently regardless of order.\n- Capacitor iOS shell may cache stale data; needs verification that stamp count refreshes correctly.\n- Rate limiting on redemption route must not block legitimate rapid staff use during busy hours.\n\n## Estimated execution cost\n| Task | Est. tokens |\n|---|---|\n| T-1 | 9k |\n| T-2 | 14k |\n| T-3 | 12k |\n| T-4 | 11k |\n| T-5 | 12k |\n| T-6 | 9k |\n| Total | 67k |\n\nThis is a rough estimate based on typical file sizes and turn counts for this stack; calibrate against the first real run."
    },
    {
      "path": "specs/digital-loyalty-card-for-cordero-coffee-club-mem/tasks.md",
      "content": "# Tasks: Digital loyalty card for Cordero Coffee Club members\n\n- [ ] T-1 Add Supabase schema/migration for stamps and rewards tables with unique constraint on stripe_event_id — satisfies AC-1, AC-2, AC-9, AC-10 — est. ~9k tokens\n- [ ] T-2 Implement Stripe webhook handler for checkout.session.completed / payment_intent.succeeded that grants exactly one stamp idempotently, and rejects client-forged stamp requests — satisfies AC-1, AC-2, AC-8 — est. ~14k tokens\n- [ ] T-3 Implement Stripe refund webhook handling: revoke stamp if reward unredeemed, log for staff review if already redeemed — satisfies AC-9, AC-10 — est. ~12k tokens\n- [ ] T-4 Build member-facing stamp count and reward-available UI shared across web app and Capacitor iOS shell — satisfies AC-3, AC-4, AC-5 — est. ~11k tokens\n- [ ] T-5 Implement staff redemption server action guarded by middleware role check ('staff' claim) and Upstash rate limiting — satisfies AC-6, AC-7 — est. ~12k tokens\n- [ ] T-6 Add Playwright e2e happy-path test covering purchase → stamp grant → 9 stamps → staff redemption — satisfies AC-1, AC-3, AC-4, AC-5, AC-6 — est. ~9k tokens"
    }
  ],
  "trace": [
    {
      "criterionId": "AC-1",
      "criterionText": "Qualifying paid purchase grants exactly one stamp via webhook",
      "taskIds": [
        "T-2"
      ]
    },
    {
      "criterionId": "AC-2",
      "criterionText": "Duplicate webhook delivery does not double-grant stamps",
      "taskIds": [
        "T-2"
      ]
    },
    {
      "criterionId": "AC-3",
      "criterionText": "Web app displays accurate stamp count",
      "taskIds": [
        "T-4"
      ]
    },
    {
      "criterionId": "AC-4",
      "criterionText": "iOS app displays same stamp count as web",
      "taskIds": [
        "T-4"
      ]
    },
    {
      "criterionId": "AC-5",
      "criterionText": "At 9 stamps, free drink reward shown as available",
      "taskIds": [
        "T-4"
      ]
    },
    {
      "criterionId": "AC-6",
      "criterionText": "Staff with role claim can redeem reward once",
      "taskIds": [
        "T-5"
      ]
    },
    {
      "criterionId": "AC-7",
      "criterionText": "Non-staff/unauthenticated redemption attempts rejected by middleware",
      "taskIds": [
        "T-5"
      ]
    },
    {
      "criterionId": "AC-8",
      "criterionText": "Client-forged stamp grant requests are rejected",
      "taskIds": [
        "T-2"
      ]
    },
    {
      "criterionId": "AC-9",
      "criterionText": "Refund before redemption revokes the stamp",
      "taskIds": [
        "T-3"
      ]
    },
    {
      "criterionId": "AC-10",
      "criterionText": "Refund after redemption does not claw back, logs for review",
      "taskIds": [
        "T-3"
      ]
    }
  ],
  "taskEstimates": [
    {
      "taskId": "T-1",
      "filesTouched": 2,
      "avgFileTokens": 1500,
      "turns": 3,
      "outputTokens": 1200
    },
    {
      "taskId": "T-2",
      "filesTouched": 3,
      "avgFileTokens": 1500,
      "turns": 5,
      "outputTokens": 3000
    },
    {
      "taskId": "T-3",
      "filesTouched": 2,
      "avgFileTokens": 1500,
      "turns": 4,
      "outputTokens": 2400
    },
    {
      "taskId": "T-4",
      "filesTouched": 3,
      "avgFileTokens": 1500,
      "turns": 4,
      "outputTokens": 2200
    },
    {
      "taskId": "T-5",
      "filesTouched": 3,
      "avgFileTokens": 1500,
      "turns": 4,
      "outputTokens": 2400
    },
    {
      "taskId": "T-6",
      "filesTouched": 1,
      "avgFileTokens": 1500,
      "turns": 3,
      "outputTokens": 1800
    }
  ]
},
  repo: {
    owner: "AlonsoLarra",
    repo: "CorderoCoffee",
    defaultBranch: "main",
    scan: CORDERO_REPO_SCAN,
  },
};

// Choose a demo scenario from the pasted Feature so the canned response matches
// what is on screen.
export function pickDemo(feature: { title: string; text: string }): DemoScenario {
  const hay = (feature.title + " " + feature.text).toLowerCase();
  if (hay.includes("cordero") || hay.includes("loyalty") || hay.includes("stamp"))
    return DEMO_CORDERO;
  return DEMO_SAMPLE;
}
