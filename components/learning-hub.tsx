"use client";

import Link from "next/link";
import { ArrowRight, Flame, History, NotebookText, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { courses } from "@/lib/data";
import { getBookProgress } from "@/lib/book-progress";
import { getRecentLearning, recordRecentLearning } from "@/lib/learning-memory";
import type { LibraryBookSummary } from "@/lib/books";

type Props = {
  books: LibraryBookSummary[];
};

type ProgressCard = {
  title: string;
  href: string;
  progress: number;
  label: string;
};

export function LearningHub({ books }: Props) {
  const [mounted, setMounted] = useState(false);
  const [recent, setRecent] = useState<ReturnType<typeof getRecentLearning>>([]);
  const [streak, setStreak] = useState(0);
  const [bookProgress, setBookProgress] = useState<ProgressCard[]>([]);

  useEffect(() => {
    const sync = () => {
      setMounted(true);
      setRecent(getRecentLearning());
      setBookProgress(
        books
          .map((book) => {
            const progress = getBookProgress(book.slug);
            if (!progress) return null;
            return {
              title: book.title,
              href: `/tutorials/${book.slug}/${progress.lastChapterSlug}`,
              progress: progress.progress,
              label: `${progress.lastChapterNumber} / ${book.chapters}`
            } satisfies ProgressCard;
          })
          .filter(Boolean) as ProgressCard[]
      );
      try {
        const raw = window.localStorage.getItem("codeverse-practice-memory");
        const parsed = raw ? JSON.parse(raw) : {};
        const dates = Array.isArray(parsed.practiceDates) ? parsed.practiceDates : [];
        setStreak(calculateStreak(dates));
      } catch {
        setStreak(0);
      }
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("codeverse-learning-memory", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("codeverse-learning-memory", sync);
    };
  }, []);

  const continueLearning = useMemo<ProgressCard | null>(() => {
    const courseProgress = courses
      .map((course) => ({
        title: course.title,
        href: course.bookSlug ? `/tutorials/${course.bookSlug}` : `/tutorial/${course.slug}`,
        progress: course.progress,
        label: `${course.lessons} lessons`
      }))
      .sort((a, b) => b.progress - a.progress);

    return [...bookProgress, ...courseProgress][0] ?? null;
  }, [bookProgress]);

  const dailyGoal = useMemo(() => {
    const completed = Math.min(3, Math.max(1, Math.round((streak || 1) / 3)));
    return { completed, total: 3 };
  }, [streak]);

  const readingBooks = useMemo(
    () => books.filter((book) => book.slug === "html-foundations" || book.slug === "css-design-systems" || book.slug === "javascript-mastery"),
    [books]
  );

  return (
    <section className="px-4 pb-6 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Continue learning</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight">Jump back into the next lesson</h2>
            {mounted && continueLearning ? (
              <>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{continueLearning.title}</p>
                <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-500">
                  <span>{continueLearning.label}</span>
                  <span>{continueLearning.progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" style={{ width: `${continueLearning.progress}%` }} />
                </div>
                <Link href={continueLearning.href} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-cyan-300">
                  Resume <ArrowRight className="size-4" />
                </Link>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Open a course or tutorial to build your learning queue.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Reading focus</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight">HTML, CSS, and JavaScript books</h2>
            <div className="mt-5 space-y-3">
              {readingBooks.map((book) => {
                const progress = getBookProgress(book.slug);
                return (
                  <Link
                    key={book.slug}
                    href={`/tutorials/${book.slug}/${progress?.lastChapterSlug ?? "chapter-01"}`}
                    onClick={() =>
                      recordRecentLearning({
                        title: book.title,
                        href: `/tutorials/${book.slug}/${progress?.lastChapterSlug ?? "chapter-01"}`,
                        kind: "book"
                      })
                    }
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left dark:bg-slate-950"
                  >
                    <span>
                      <span className="block text-sm font-black">{book.title}</span>
                      <span className="block text-xs font-semibold text-slate-500">{progress?.progress ?? 0}% complete</span>
                    </span>
                    <ArrowRight className="size-4 text-brand-600" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Learning streak</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight">{streak} day streak</h2>
              </div>
              <Flame className="size-8 text-amber-500" />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Keep the streak alive with one short lesson or practice task today.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Today&apos;s goal</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight">
              {dailyGoal.completed} of {dailyGoal.total} lessons completed
            </h2>
            <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-brand-500"
                style={{ width: `${(dailyGoal.completed / dailyGoal.total) * 100}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              A short daily target keeps reading, revision, and practice consistent.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Recently viewed</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight">Open learning items</h2>
              </div>
              <History className="size-7 text-brand-600" />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(mounted && recent.length ? recent : fallbackRecent()).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900"
                >
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    {item.kind === "book" ? <NotebookText className="size-4" /> : <PlayCircle className="size-4" />}
                    {item.kind}
                  </div>
                  <p className="mt-2 font-black">{item.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function calculateStreak(practiceDates: string[]) {
  const dates = new Set(practiceDates);
  let streak = 0;
  const cursor = new Date();

  while (streak < 365) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function fallbackRecent(): Array<{ title: string; href: string; kind: "course" | "tutorial" | "project" | "practice" | "book" }> {
  return [
    { title: "HTML Foundations", href: "/tutorials/html-foundations/chapter-01", kind: "book" },
    { title: "CSS Design Systems", href: "/tutorials/css-design-systems/chapter-01", kind: "book" },
    { title: "JavaScript Mastery", href: "/tutorials/javascript-mastery/chapter-01", kind: "book" }
  ];
}
