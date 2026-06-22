"use client";

import Link from "next/link";
import { ArrowRight, Command, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { courses, learningSheets, mockTests, projects, tutorialArticles, tutorialTracks } from "@/lib/data";
import librarySearchIndex from "@/data/books/search-index.json";

type ResultItem = {
  label: string;
  href: string;
  group: string;
  meta?: string;
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const grouped = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const items: ResultItem[] = [
      ...courses.map((course) => ({
        label: course.title,
        href: course.bookSlug ? `/tutorials/${course.bookSlug}` : `/tutorial/${course.slug}`,
        group: "Courses",
        meta: `${course.category} • ${course.level}`
      })),
      ...tutorialTracks.map((track) => ({
        label: track.title,
        href: track.slug === "python-backend-development" ? `/tutorials/${track.slug}` : `/tutorial/${track.slug}`,
        group: "Lessons",
        meta: track.level
      })),
      ...tutorialArticles.map((article) => ({
        label: article.title,
        href: `/tutorials`,
        group: "Lessons",
        meta: article.track
      })),
      ...projects.map((project) => ({
        label: project,
        href: "/projects",
        group: "Projects",
        meta: "Project idea"
      })),
      ...learningSheets.map((sheet) => ({
        label: sheet,
        href: "/practice",
        group: "Practice",
        meta: "Revision sheet"
      })),
      ...mockTests.map((test) => ({
        label: test.title,
        href: "/practice",
        group: "Practice",
        meta: `${test.questions} questions`
      })),
      ...librarySearchIndex.map((item) => ({
        label: item.label,
        href: item.href,
        group: item.group,
        meta: item.meta
      }))
    ];

    const filtered = normalized
      ? items.filter((item) => `${item.label} ${item.group} ${item.meta ?? ""}`.toLowerCase().includes(normalized))
      : items;

    return filtered.reduce<Record<string, ResultItem[]>>((acc, item) => {
      acc[item.group] = acc[item.group] || [];
      acc[item.group].push(item);
      return acc;
    }, {});
  }, [query]);

  const hasResults = Object.values(grouped).some((items) => items.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden h-11 flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 pl-10 text-left text-sm text-slate-500 transition hover:border-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:flex"
        aria-label="Search courses, lessons, projects, and practice"
      >
        <Search className="pointer-events-none absolute left-3 size-4 text-slate-400" />
        <span>Search courses, lessons, projects, and practice</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:border-slate-700">
          <Command className="size-3" /> K
        </span>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-500 sm:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
      >
        <Search className="size-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
              <Search className="size-5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses, lessons, projects, and practice..."
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 dark:border-slate-800 dark:text-slate-300"
                aria-label="Close search"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4">
              {hasResults ? (
                <div className="space-y-5">
                  {Object.entries(grouped).map(([group, items]) =>
                    items.length ? (
                      <section key={group}>
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">{group}</p>
                        <div className="mt-3 grid gap-2">
                          {items.slice(0, 6).map((item) => (
                            <Link
                              key={`${group}-${item.label}`}
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-brand-500 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                            >
                              <span>
                                <span className="block font-black text-ink dark:text-white">{item.label}</span>
                                {item.meta ? <span className="block text-xs font-semibold text-slate-500">{item.meta}</span> : null}
                              </span>
                              <ArrowRight />
                            </Link>
                          ))}
                        </div>
                      </section>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
                  No results found. Try another course, lesson, project, or practice topic.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
