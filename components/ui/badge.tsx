import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "default" | "brand" | "success" | "warning" | "danger" | "neutral";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200",
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-cyan-300",
  success: "bg-leaf/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-100/70 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  danger: "bg-coral/10 text-red-700 dark:text-red-300",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300"
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children?: ReactNode;
};

export function Badge({ variant = "default", className = "", children, ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}