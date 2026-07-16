"use client";

import { BookOpen, CheckCircle2 } from "lucide-react";

type ChapterItem = {
  number: number;
  slug: string;
  title: string;
};

type Props = {
  chapters: ChapterItem[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  completedSlugs?: Set<string>;
};

export function CourseSidebar({ chapters, activeSlug, onSelect, completedSlugs }: Props) {
  return (
    <nav className="space-y-1">
      <div className="mb-4 flex items-center gap-2 px-1">
        <BookOpen className="size-4 text-brand-600" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Chapters</span>
      </div>
      {chapters.map((ch) => {
        const isActive = ch.slug === activeSlug;
        const isCompleted = completedSlugs?.has(ch.slug);
        return (
          <button
            key={ch.slug}
            onClick={() => onSelect(ch.slug)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
              isActive
                ? "bg-brand-50 text-brand-700 font-bold dark:bg-brand-950/30 dark:text-cyan-300"
                : "text-slate-600 hover:bg-slate-50 font-semibold dark:text-slate-400 dark:hover:bg-slate-800/50"
            }`}
          >
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-black ${
                isActive
                  ? "bg-brand-600 text-white"
                  : isCompleted
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {isCompleted ? <CheckCircle2 className="size-4" /> : ch.number}
            </span>
            <span className="leading-tight">{ch.title}</span>
          </button>
        );
      })}
    </nav>
  );
}
