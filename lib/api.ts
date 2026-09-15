import type { ReadinessReport, RepoScan } from "./types";

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

export function fetchReadiness(
  feature: { title: string; text: string },
  repoScan?: RepoScan,
): Promise<ReadinessReport> {
  return postJson<ReadinessReport>("/api/readiness", { feature, repoScan });
}
