import type {
  Answer,
  CostEstimate,
  HandoffSession,
  ReadinessReport,
  SpecPack,
} from "./types";

// A saved conversion, so a Feature already turned into a spec pack can be
// reopened without re-running the analysis. Persisted in localStorage (survives
// across sessions, per browser). No server, no database (brief §1).

export type HistoryEntry = {
  id: string;
  title: string;
  createdAt: string; // ISO
  slug: string;
  repoLabel?: string; // e.g. "AlonsoLarra/CorderoCoffee"
  feature: { title: string; text: string };
  readiness?: ReadinessReport;
  answers: Answer[];
  specPack: SpecPack;
  costEstimate?: CostEstimate;
  repo?: HandoffSession["repo"];
};

const KEY = "handoff-history";
const CAP = 25;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, CAP)));
  } catch {
    // ignore — history is a convenience
  }
}

// Prepend an entry, de-duplicating by title (a re-run of the same Feature
// replaces the older record rather than piling up).
export function saveEntry(entry: HistoryEntry): HistoryEntry[] {
  const existing = loadHistory().filter(
    (e) => e.title.trim().toLowerCase() !== entry.title.trim().toLowerCase(),
  );
  const next = [entry, ...existing];
  write(next);
  return next;
}

export function deleteEntry(id: string): HistoryEntry[] {
  const next = loadHistory().filter((e) => e.id !== id);
  write(next);
  return next;
}

export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
