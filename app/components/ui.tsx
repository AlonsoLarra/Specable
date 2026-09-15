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
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline py-4">
      <p className="min-w-0 truncate text-[15px]">
        <span className="text-secondary">{label}</span>{" "}
        <span className="text-foreground">{value}</span>
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
