import type { ReactNode } from "react";

type CalloutTone = "info" | "warning" | "success" | "danger";

const TONES: Record<CalloutTone, string> = {
  info: "border-brand-500 bg-cyan-50 text-cyan-950 dark:bg-cyan-950/30 dark:text-cyan-100",
  warning: "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
  success: "border-leaf bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
  danger: "border-coral bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-100"
};

type CalloutProps = {
  tone?: CalloutTone;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Callout({ tone = "info", title, children, className = "" }: CalloutProps) {
  return (
    <div className={`my-5 rounded-2xl border-l-4 p-5 leading-7 ${TONES[tone]} ${className}`}>
      {title ? <p className="mb-1 font-black">{title}</p> : null}
      <div className="whitespace-pre-wrap">{children}</div>
    </div>
  );
}