import { SAMPLE_CORDERO, SAMPLE_FEATURE } from "./sample";

// The Feature is pasted into a single textarea (brief §2.1). Pull a leading
// "Title:" line out if present; otherwise leave the title empty and let
// readiness name it. Everything else is the body.
export function parseFeatureText(raw: string): { title: string; text: string } {
  const trimmed = raw.trim();
  const lines = trimmed.split("\n");
  const first = lines[0]?.trim() ?? "";
  const m = first.match(/^title:\s*(.+)$/i);
  if (m) {
    return { title: m[1].trim(), text: lines.slice(1).join("\n").trim() };
  }
  return { title: "", text: trimmed };
}

// The single-textarea form of the seeded sample, title line included.
export function sampleFeatureText(): string {
  return `Title: ${SAMPLE_FEATURE.title}\n\n${SAMPLE_FEATURE.text}`;
}

export function corderoFeatureText(): string {
  return `Title: ${SAMPLE_CORDERO.title}\n\n${SAMPLE_CORDERO.text}`;
}
