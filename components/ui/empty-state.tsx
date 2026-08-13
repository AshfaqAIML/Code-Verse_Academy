import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40 ${className}`}>
      {icon ? (
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-cyan-300">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-black tracking-tight text-ink dark:text-white">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}