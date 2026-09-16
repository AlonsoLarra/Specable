"use client";

import { useState } from "react";
import type { RepoScan } from "@/lib/types";

export function RepoPanel({
  owner,
  repo,
  scan,
}: {
  owner: string;
  repo: string;
  scan: RepoScan;
}) {
  const [open, setOpen] = useState(false);
  const constitutionLine =
    scan.constitution.source === "found"
      ? `Found constitution at ${scan.constitution.path}`
      : "No constitution found — inferred from the repo. Review before export.";

  return (
    <div className="border-b border-hairline py-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="min-w-0 text-[15px]">
          <span className="text-secondary">Connected repo</span>{" "}
          <span className="font-mono text-[13px]">
            {owner}/{repo}
          </span>
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 text-[13px] text-accent underline-offset-4 hover:underline"
        >
          {open ? "Hide" : "Inspect"}
        </button>
      </div>
      {scan.stack.length > 0 && (
        <p className="mt-1 text-[13px] text-secondary">{scan.stack.join(" · ")}</p>
      )}
      <p className="mt-1 text-[13px] text-secondary">{constitutionLine}</p>

      {open && (
        <div className="mt-3">
          {scan.conventions.length > 0 && (
            <>
              <p className="text-[13px] text-secondary">Conventions</p>
              <ul className="mt-1 mb-3 list-disc pl-5 text-[13px]">
                {scan.conventions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </>
          )}
          <p className="text-[13px] text-secondary">Constitution</p>
          <pre className="mt-1 overflow-x-auto rounded-lg border border-hairline bg-white p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
            {scan.constitution.markdown}
          </pre>
        </div>
      )}
    </div>
  );
}
