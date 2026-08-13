import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-b border-slate-200 px-5 py-4 dark:border-slate-800 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-t border-slate-200 px-5 py-4 dark:border-slate-800 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`font-black tracking-tight text-ink dark:text-white ${className}`} {...rest}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400 ${className}`} {...rest}>
      {children}
    </p>
  );
}