"use client";

import { useState } from "react";
import type { SpecPack } from "@/lib/types";
import { Button, StepHeading } from "./ui";

function basename(path: string): string {
  return path.split("/").pop() || path;
}

async function downloadZip(specPack: SpecPack, slug: string) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const f of specPack.files) zip.file(f.path, f.content);
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `handoff-${slug}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function concatAll(specPack: SpecPack): string {
  return specPack.files
    .map((f) => `--- ${f.path} ---\n\n${f.content}`)
    .join("\n\n");
}

export function SpecPackStep({
  specPack,
  slug,
  outcome,
  onRegenerate,
}: {
  specPack: SpecPack;
  slug: string;
  outcome: string;
  onRegenerate: () => void;
}) {
  const [view, setView] = useState<"files" | "trace">("files");
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);

  const file = specPack.files[selected] ?? specPack.files[0];
  const unmapped = specPack.trace.filter((t) => t.taskIds.length === 0).length;

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(concatAll(specPack));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — no-op
    }
  }

  return (
    <section className="py-8">
      <StepHeading>Spec pack</StepHeading>

      <div className="mt-4 flex items-center gap-4 text-[13px]">
        <button
          onClick={() => setView("files")}
          className={
            view === "files"
              ? "text-foreground"
              : "text-secondary underline-offset-4 hover:underline"
          }
        >
          Files
        </button>
        <button
          onClick={() => setView("trace")}
          className={
            view === "trace"
              ? "text-foreground"
              : "text-secondary underline-offset-4 hover:underline"
          }
        >
          Trace{unmapped > 0 ? ` · ${unmapped} unmapped` : ""}
        </button>
      </div>

      {view === "files" ? (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <ul className="shrink-0 sm:w-44">
            {specPack.files.map((f, i) => (
              <li key={f.path}>
                <button
                  onClick={() => setSelected(i)}
                  className={`w-full py-1.5 text-left text-[13px] ${
                    i === selected ? "text-accent" : "text-secondary hover:text-foreground"
                  }`}
                >
                  {basename(f.path)}
                </button>
              </li>
            ))}
          </ul>
          <pre className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-hairline bg-white p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
            {file?.content}
          </pre>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-[13px] text-secondary">Outcome</p>
          <p className="mt-0.5 text-[15px]">{outcome}</p>
          <div className="mt-4 divide-y divide-hairline border-t border-hairline">
            {specPack.trace.map((t) => {
              const orphan = t.taskIds.length === 0;
              return (
                <div key={t.criterionId} className="py-3">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-[13px] ${orphan ? "text-warning" : "text-secondary"}`}
                    >
                      {t.criterionId}
                    </span>
                    <span className="text-[15px]">{t.criterionText}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {orphan ? (
                      <span className="text-[13px] text-warning">
                        No task satisfies this — an agent will skip it.
                      </span>
                    ) : (
                      t.taskIds.map((id) => (
                        <span
                          key={id}
                          className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[12px] text-secondary"
                        >
                          {id}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Button onClick={() => downloadZip(specPack, slug)}>Download files</Button>
        <button
          onClick={copyAll}
          className="text-[13px] text-foreground underline-offset-4 hover:underline"
        >
          {copied ? "Copied" : "Copy all"}
        </button>
        <button
          onClick={onRegenerate}
          className="text-[13px] text-secondary underline-offset-4 hover:underline"
        >
          Regenerate
        </button>
      </div>
    </section>
  );
}
