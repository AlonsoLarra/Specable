"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

// Primary = solid accent, 36px tall, 8px radius. Secondary = text-only with
// underline on hover. Never more than one primary visible (brief §8).
export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex h-9 items-center justify-center text-[15px] transition-colors disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "rounded-lg bg-accent px-4 text-white hover:bg-accent/90 disabled:bg-accent/40"
      : "px-0 text-foreground underline-offset-4 hover:underline disabled:text-secondary";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

// A completed step compresses to a single summary line with an Edit link.
export function StepSummary({
  label,
  value,
  onEdit,
  leading,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  leading?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline py-4">
      <p className="flex min-w-0 items-baseline gap-2 truncate text-[15px]">
        {leading}
        <span className="truncate">
          <span className="text-secondary">{label}</span>{" "}
          <span className="text-foreground">{value}</span>
        </span>
      </p>
      {onEdit && (
        <button
          onClick={onEdit}
          className="shrink-0 text-[13px] text-accent underline-offset-4 hover:underline"
        >
          Edit
        </button>
      )}
    </div>
  );
}

export function StepHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-[18px] font-medium tracking-tight">{children}</h2>;
}

// Traffic-light tiers for a readiness score (0–39 red, 40–79 yellow, 80–100 green).
export type ScoreTier = "red" | "yellow" | "green";
export function scoreTier(n: number): ScoreTier {
  if (n >= 80) return "green";
  if (n >= 40) return "yellow";
  return "red";
}
const TIER_BG: Record<ScoreTier, string> = {
  red: "bg-score-red",
  yellow: "bg-score-yellow",
  green: "bg-score-green",
};
const TIER_TEXT: Record<ScoreTier, string> = {
  red: "text-score-red",
  yellow: "text-score-yellow",
  green: "text-score-green",
};
export function tierTextClass(n: number): string {
  return TIER_TEXT[scoreTier(n)];
}

// A small filled dot in the tier color — the red/yellow/green indicator.
export function ScoreDot({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 rounded-full ${TIER_BG[scoreTier(value)]} ${className}`}
    />
  );
}

// A 4px hairline that fills in — accent by default, or the score's tier color
// when colorByTier is set (§8's "chart", now traffic-lit for readiness).
export function ScoreBar({
  label,
  value,
  colorByTier = false,
}: {
  label: string;
  value: number;
  colorByTier?: boolean;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const fill = colorByTier ? TIER_BG[scoreTier(v)] : "bg-accent";
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-[13px] text-secondary">{label}</span>
      <div className="h-1 flex-1 rounded-full bg-hairline">
        <div className={`h-1 rounded-full ${fill}`} style={{ width: `${v}%` }} />
      </div>
      <span className="w-7 shrink-0 text-right text-[13px] tabular-nums text-secondary">
        {v}
      </span>
    </div>
  );
}

// A small, quiet label — sentence case, no box, no all-caps (§8).
export function Tag({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "warning";
}) {
  const color = tone === "warning" ? "text-warning" : "text-secondary";
  return <span className={`text-[13px] ${color}`}>{children}</span>;
}
