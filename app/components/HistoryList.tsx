"use client";

import type { HistoryEntry } from "@/lib/history";

function when(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function HistoryList({
  entries,
  onOpen,
  onDelete,
}: {
  entries: HistoryEntry[];
  onOpen: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <section className="py-8">
      <h2 className="text-[18px] font-medium tracking-tight">Recent specs</h2>
      <p className="mt-2 text-[15px] text-secondary">
        Reopen a spec pack you already generated — no re-analysis.
      </p>
      <div className="mt-4 divide-y divide-hairline border-t border-hairline">
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <button
              onClick={() => onOpen(e)}
              className="min-w-0 truncate text-left text-[15px] text-foreground underline-offset-4 hover:underline"
            >
              {e.title || "Untitled feature"}
            </button>
            <div className="flex shrink-0 items-baseline gap-3 text-[13px] text-secondary">
              {e.repoLabel && <span className="hidden sm:inline">{e.repoLabel}</span>}
              <span>{when(e.createdAt)}</span>
              <button
                onClick={() => onDelete(e.id)}
                className="underline-offset-4 hover:underline hover:text-warning"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
