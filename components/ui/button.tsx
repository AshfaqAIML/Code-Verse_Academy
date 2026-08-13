import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "brand" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white hover:bg-slate-800 dark:bg-white dark:text-ink dark:hover:bg-slate-200",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-600 dark:hover:text-cyan-300",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  brand: "bg-brand-600 text-white hover:bg-brand-700",
  danger: "bg-coral text-white hover:bg-red-600"
};

const SIZES: Record<ButtonSize, string> = {
  sm: "gap-1.5 rounded-lg px-3 py-2 text-sm",
  md: "gap-2 rounded-xl px-4 py-2.5 text-sm",
  lg: "gap-2 rounded-xl px-5 py-3 text-base",
  icon: "gap-0 rounded-lg p-2"
};

export function Button({ variant = "primary", size = "md", className = "", children, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}