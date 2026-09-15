import type { ReadinessReport, SpecPack } from "./types";

// Pre-captured real responses for demo mode (no Anthropic call). Generated from
// the seeded sample Feature via the live routes. Regenerate by capturing the
// route outputs again if the schemas change.

export const DEMO_SLUG = "let-brokers-see-claim-status-online";

export const DEMO_READINESS: ReadinessReport = {
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
};

export const DEMO_SPEC_PACK: SpecPack = {
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
};
