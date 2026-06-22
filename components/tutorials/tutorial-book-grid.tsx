"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Clock3, Layers3, Search } from "lucide-react";
import type { LibraryBookSummary } from "@/lib/books";
import { getBookProgress } from "@/lib/book-progress";
import { recordRecentLearning } from "@/lib/learning-memory";

type TutorialBookGridProps = {
  books: LibraryBookSummary[];
};

const coverThemes: Record<string, { a: string; b: string; c: string; accent: string }> = {
  aurora: {
    a: "from-cyan-500",
    b: "via-teal-500",
    c: "to-slate-950",
    accent: "text-cyan-100"
  },
  midnight: {
    a: "from-indigo-500",
    b: "via-violet-500",
    c: "to-slate-950",
    accent: "text-violet-100"
  },
  default: {
    a: "from-brand-500",
    b: "via-cyan-500",
    c: "to-slate-950",
    accent: "text-cyan-50"
  }
};

export function TutorialBookGrid({ books }: TutorialBookGridProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    for (const book of books) {
      next[book.slug] = getBookProgress(book.slug)?.progress ?? 0;
    }
    setProgressMap(next);

    const sync = () => {
      const refresh: Record<string, number> = {};
      for (const book of books) {
        refresh[book.slug] = getBookProgress(book.slug)?.progress ?? 0;
      }
      setProgressMap(refresh);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("codeverse-learning-memory", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("codeverse-learning-memory", sync);
    };
  }, [books]);

  const filteredBooks = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) return books;
    return books.filter((book) =>
      [book.title, book.category, book.level, book.description, book.source, String(book.chapters), String(book.lessons ?? "")].join(" ").toLowerCase().includes(normalized)
    );
  }, [books, deferredQuery]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <Search className="size-5 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search tutorial books"
          placeholder="Search by title, chapter, part, or lesson..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {filteredBooks.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredBooks.map((book) => {
            const progress = progressMap[book.slug] ?? 0;
            const theme = coverThemes[book.coverTheme ?? "default"] ?? coverThemes.default;
            const estimatedMinutes = book.estimatedMinutes ?? Math.max(12, Math.round(book.chapters * 6));
            const completed = progress >= 100;

            return (
              <Link
                key={book.slug}
                href={`/tutorials/${book.slug}`}
                onClick={() =>
                  recordRecentLearning({
                    title: book.title,
                    href: `/tutorials/${book.slug}`,
                    kind: "book"
                  })
                }
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-2xl hover:shadow-cyan-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >
                <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${theme.a} ${theme.b} ${theme.c}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.36),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,.28),transparent_35%)]" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-white/90 backdrop-blur">
                    {book.category}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-end justify-between gap-3">
                      <div className="max-w-[65%]">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/70">Volume</p>
                        <h3 className="mt-2 text-2xl font-black tracking-tight text-white">{book.title}</h3>
                      </div>
                      <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-right backdrop-blur">
                        <p className={`text-xs font-black uppercase tracking-[0.22em] ${theme.accent}`}>{book.level}</p>
                        <p className="mt-1 text-xs font-semibold text-white/75">{estimatedMinutes} min read</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{book.description}</p>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-xs font-bold text-slate-500 dark:text-slate-300">
                    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock3 className="size-4" />
                        Time
                      </div>
                      <p className="mt-2 text-sm font-black text-ink dark:text-white">{estimatedMinutes} min</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Layers3 className="size-4" />
                        Chapters
                      </div>
                      <p className="mt-2 text-sm font-black text-ink dark:text-white">{book.chapters}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                      <div className="flex items-center gap-2 text-slate-400">
                        <BookOpen className="size-4" />
                        Lessons
                      </div>
                      <p className="mt-2 text-sm font-black text-ink dark:text-white">{book.lessons ?? "—"}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-black text-ink dark:text-white">{completed ? "Completed" : progress > 0 ? "In progress" : "Not started"}</p>
                      <p className="text-slate-500">{progress}% complete</p>
                    </div>
                    <span className="inline-flex items-center gap-2 font-black text-brand-700 transition group-hover:translate-x-1 dark:text-cyan-300">
                      Read
                      <ArrowRight className="size-4" />
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${theme.a} ${theme.b}`}
                      style={{ width: `${Math.max(progress, 6)}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/60">
          No books match your search. Try a chapter name, lesson title, or topic like Python, SQL, or Generative AI.
        </div>
      )}
    </div>
  );
}
