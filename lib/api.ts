import type { Answer, ReadinessReport, RepoScan, SpecPack } from "./types";
import { DEMO_READINESS, DEMO_SLUG, DEMO_SPEC_PACK } from "./fixtures";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Thin client for our own route handlers. Throws Error(message) with the
// server's sentence-with-a-next-step on failure.
async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || "Something went wrong. Try again.",
    );
  }
  return data as T;
}

export async function fetchReadiness(
  feature: { title: string; text: string },
  repoScan?: RepoScan,
  demo = false,
): Promise<ReadinessReport> {
  // Demo mode: return a pre-captured real response, no Anthropic call. A short
  // delay keeps the loading state visible so the demo reads as real work.
  if (demo) {
    await delay(1200);
    return DEMO_READINESS;
  }
  return postJson<ReadinessReport>("/api/readiness", { feature, repoScan });
}

export type SpecPackStreamHandlers = {
  onProgress?: (chars: number) => void;
  onDone: (specPack: SpecPack, slug: string) => void;
  onError: (message: string) => void;
};

// Reads the /api/spec-pack NDJSON stream and dispatches events. Renders progress
// while the pack generates; delivers the validated pack on "done".
export async function streamSpecPack(
  body: {
    feature: { title: string; text: string };
    answers: Answer[];
    gapLabels: Record<string, { question: string; owner: string; pillar: string }>;
    repoScan?: RepoScan;
  },
  handlers: SpecPackStreamHandlers,
  demo = false,
): Promise<void> {
  // Demo mode: replay a pre-captured pack with simulated streaming progress.
  if (demo) {
    const total = DEMO_SPEC_PACK.files.reduce((n, f) => n + f.content.length, 0);
    for (let i = 1; i <= 6; i++) {
      await delay(300);
      handlers.onProgress?.(Math.round((total * i) / 6));
    }
    handlers.onDone(DEMO_SPEC_PACK, DEMO_SLUG);
    return;
  }

  const res = await fetch("/api/spec-pack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    handlers.onError(
      (data as { error?: string }).error || "Generation failed. Try again.",
    );
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const raw = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!raw) continue;
      let evt: {
        type: string;
        chars?: number;
        specPack?: SpecPack;
        slug?: string;
        error?: string;
      };
      try {
        evt = JSON.parse(raw);
      } catch {
        continue;
      }
      if (evt.type === "progress") handlers.onProgress?.(evt.chars ?? 0);
      else if (evt.type === "done" && evt.specPack)
        handlers.onDone(evt.specPack, evt.slug ?? "feature");
      else if (evt.type === "error")
        handlers.onError(evt.error ?? "Generation failed.");
    }
  }
}
