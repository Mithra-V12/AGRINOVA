import { HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card-surface p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({
  tone = "canopy",
  children,
  className,
}: {
  tone?: "canopy" | "clay" | "alert" | "amber" | "ink";
  children: ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    canopy: "bg-sprout-light text-forest",
    clay: "bg-clay/20 text-clay-dark",
    alert: "bg-alert/10 text-alert",
    amber: "bg-amber/15 text-clay-dark",
    ink: "bg-ink-soft/10 text-ink-soft",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StrataScore({
  label,
  value,
  max = 100,
  suffix = "",
  size = "md",
}: {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  size?: "sm" | "md";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className={cn("text-ink-soft font-medium", size === "sm" ? "text-xs" : "text-sm")}>{label}</span>
        <span className="font-mono-data font-semibold text-forest">
          {value}
          {suffix}
          <span className="text-ink-soft font-normal">/{max}{suffix}</span>
        </span>
      </div>
      <div className="strata-score-track">
        <div className="strata-score-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-forest-dark">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-forest/15 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-soft/60 focus:border-canopy outline-none transition-colors",
        props.className
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-lg border border-forest/15 bg-white px-3.5 py-2.5 text-[15px] text-ink focus:border-canopy outline-none transition-colors",
        props.className
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg border border-forest/15 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-soft/60 focus:border-canopy outline-none transition-colors resize-none",
        props.className
      )}
    />
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono-data text-xs tracking-wider uppercase text-canopy font-semibold mb-2">{children}</p>;
}
