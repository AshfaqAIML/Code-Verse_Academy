"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  Code2,
  Flame,
  FlaskConical,
  NotebookText,
  RotateCcw,
  Trophy,
  X,
  Zap
} from "lucide-react";
import { LearningChart, SkillChart } from "@/components/charts";
import { Section } from "@/components/section";
import { RevisionCenter } from "@/components/revision/revision-center";
import { getDashboardStats, getPracticeDates } from "@/lib/stats";
import {
  computeSkillBars,
  computeWeeklyActivity,
  getBookmarks,
  getContinueLearning,
  getRecentLearning,
  getTodayPlan
} from "@/lib/learning-summary";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import StreakBoard from "@/components/streak-board/StreakBoard";

const planIcons = {
  book: BookOpen,
  practice: Code2,
  playground: FlaskConical,
  revision: RotateCcw
};

const primaryLink =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-white dark:text-ink dark:ring-offset-slate-950 dark:hover:bg-slate-200";

const ghostLink =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white";

type Summary = {
  streak: string;
  xp: string;
  completed: string;
  practiceDays: string;
  continued: ReturnType<typeof getContinueLearning>;
  plan: ReturnType<typeof getTodayPlan>;
  skills: ReturnType<typeof computeSkillBars>;
  weekly: ReturnType<typeof computeWeeklyActivity>;
  recent: ReturnType<typeof getRecentLearning>;
  bookmarks: ReturnType<typeof getBookmarks>;
  loaded: boolean;
};

const EMPTY: Summary = {
  streak: "0 days",
  xp: "0",
  completed: "0",
  practiceDays: "0",
  continued: null,
  plan: [],
  skills: [],
  weekly: [],
  recent: [],
  bookmarks: [],
  loaded: false
};

function collect(): Summary {
  const stats = getDashboardStats();
  const continued = getContinueLearning();
  return {
    streak: `${stats.streak} ${stats.streak === 1 ? "day" : "days"}`,
    xp: String(stats.xp),
    completed: String(stats.completed),
    practiceDays: String(getPracticeDates().length),
    continued,
    plan: getTodayPlan(),
    skills: computeSkillBars(),
    weekly: computeWeeklyActivity(),
    recent: getRecentLearning(),
    bookmarks: getBookmarks(),
    loaded: true
  };
}

export default function DashboardPage() {
  const [streakOpen, setStreakOpen] = useState(false);
  const [summary, setSummary] = useState<Summary>(EMPTY);

  useEffect(() => {
    const refresh = () => setSummary(collect());
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const { streak, xp, completed, practiceDays, continued, plan, skills, weekly, recent, bookmarks } = summary;

  return (
    <>
      <Section
        eyebrow="Student dashboard"
        title="Your learning dashboard"
        copy="Track lessons, streaks, XP, practice days and saved material — all derived from your real progress in one place."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Learning streak", streak, Flame],
            ["XP points", xp, Zap],
            ["Completed lessons", completed, BadgeCheck],
            ["Practice days", practiceDays, Trophy]
          ].map(([label, value, Icon]) => (
            <div key={label as string} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <Icon className="mb-5 size-7 text-brand-600" />
              <p className="text-3xl font-black">{value as string}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">{label as string}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-black">Continue learning</h3>
                <Link href="/tutorials" className={ghostLink}>
                  Browse books
                </Link>
              </div>
              {continued ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand">{continued.level || "Course"}</Badge>
                      {continued.progress >= 100 ? <Badge variant="success">Completed</Badge> : null}
                    </div>
                    <p className="mt-3 truncate text-lg font-black text-ink dark:text-white">{continued.title}</p>
                    <p className="text-sm text-slate-500">Chapter {continued.lastChapterNumber}</p>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${continued.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-500">{continued.progress}% complete</p>
                  </div>
                  <Link href={continued.href} className={primaryLink}>
                    Resume
                  </Link>
                </div>
              ) : (
                <EmptyState
                  icon={<BookOpen className="size-6" />}
                  title={summary.loaded ? "Nothing in progress yet" : "Loading your progress\u2026"}
                  description={
                    summary.loaded
                      ? "Start a tutorial and you can pick up right where you left off, with your progress tracked automatically."
                      : undefined
                  }
                  action={
                    summary.loaded ? (
                      <Link href="/tutorials" className={primaryLink}>
                        Explore tutorials
                      </Link>
                    ) : undefined
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="mb-4 text-xl font-black">Today&apos;s plan</h3>
              {plan.length > 0 ? (
                <ol className="space-y-2">
                  {plan.map((item, i) => {
                    const Icon = planIcons[item.icon];
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800"
                        >
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-cyan-300">
                            <Icon className="size-4" />
                          </span>
                          <p className="text-sm font-bold leading-5 text-ink dark:text-white">
                            <span className="mr-1.5 text-slate-400">#{i + 1}</span>
                            {item.label}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-sm text-slate-500">Your plan will appear here each day.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <Card>
            <CardContent>
              <h3 className="mb-4 text-xl font-black">Your weekly XP</h3>
              {summary.loaded && weekly.length > 0 ? (
                <LearningChart data={weekly} />
              ) : (
                <p className="text-sm text-slate-500">
                  Complete practice tasks to see your XP build up week by week here.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="mb-4 text-xl font-black">Skill profile</h3>
              {summary.loaded && skills.length > 0 ? (
                <SkillChart data={skills.map((s) => ({ subject: s.label, score: s.progress }))} />
              ) : (
                <p className="text-sm text-slate-500">
                  Your skill bars appear as you make progress through different topics.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <Card>
            <CardContent>
              <h3 className="mb-4 text-xl font-black">Recent activity</h3>
              {recent.length > 0 ? (
                <ul className="space-y-3">
                  {recent.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 transition hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-black text-ink dark:text-white">{item.title}</p>
                          <p className="text-xs font-bold capitalize text-slate-500">{item.kind}</p>
                        </div>
                        <span className="text-xs font-bold text-brand-700 dark:text-cyan-300">
                          {new Date(item.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<Zap className="size-6" />}
                  title="No activity yet"
                  description="Anything you open or practice will show up here so you can jump straight back in."
                  action={
                    <Link href="/tutorials" className={primaryLink}>
                      Start something
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="mb-4 text-xl font-black">Bookmarks</h3>
              {bookmarks.length > 0 ? (
                <ul className="space-y-3">
                  {bookmarks.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800"
                      >
                        <NotebookText className="size-5 shrink-0 text-brand-600" />
                        <div className="min-w-0">
                          <p className="truncate font-black text-ink dark:text-white">{item.title}</p>
                          <p className="text-xs font-bold capitalize text-slate-500">{item.kind}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<NotebookText className="size-6" />}
                  title="Nothing saved yet"
                  description="Bookmark tutorials, lessons and projects to keep them here for easy access."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <RevisionCenter />
      </Section>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setStreakOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40"
        >
          <Flame className="size-4" />
          Streak
        </button>
      </div>

      {streakOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm pt-12 pb-12">
          <div className="relative w-full max-w-3xl animate-in fade-in zoom-in-95 duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Flame className="size-5 text-orange-500" />
                  <h2 className="text-lg font-black">Streak & Leaderboard</h2>
                </div>
                <button
                  onClick={() => setStreakOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="p-6">
                <StreakBoard />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}