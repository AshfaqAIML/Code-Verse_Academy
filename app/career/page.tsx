"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Compass, Loader2, PlayCircle, Trophy } from "lucide-react";
import { computeCareer, type CareerData } from "@/lib/career";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const primaryLink =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-white dark:text-ink dark:ring-offset-slate-950 dark:hover:bg-slate-200";

const statusBadge: Record<string, { label: string; className: string }> = {
  done: { label: "Mastered", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  "in-progress": { label: "Learning", className: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200" },
  todo: { label: "Not started", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" }
};

export default function CareerPage() {
  const [data, setData] = useState<CareerData | null>(null);

  useEffect(() => {
    setData(computeCareer());
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-black uppercase tracking-wide text-brand-600 dark:text-cyan-300">
          <Compass className="size-4" /> Career
        </p>
        <h1 className="text-3xl font-black tracking-tight text-ink dark:text-white sm:text-4xl">
          Your skill graph & path
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Everything below is built from your real progress — lessons mastered, practice completed and flashcards
          reviewed. There are no fabricated numbers here.
        </p>
      </header>

      {!data ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : !data.hasAnyProgress ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={<Compass className="size-6" />}
              title="No skill data yet"
              description="Start a course and complete a few lessons to build your skill graph. Every lesson you finish counts toward your rank."
              action={
                <Link href="/tutorials" className={primaryLink}>
                  Start learning
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Current rank</p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-ink dark:text-white">{data.rank.title}</h2>
                <div className="mt-3 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-brand-600 dark:bg-cyan-400"
                    style={{ width: `${data.rankProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                  {data.rank.next !== null
                    ? `${data.xp} XP · ${data.rank.next - data.xp} XP to ${data.rank.next > 3000 ? "top rank" : "next rank"}`
                    : "Top rank reached — keep building."}
                </p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <div className="text-right">
                  <p className="text-4xl font-black text-ink dark:text-white">{data.xp}</p>
                  <p className="text-sm font-black text-slate-500 dark:text-slate-400">Total XP</p>
                </div>
                <Badge className="w-fit">
                  {data.masteredLessons} lesson{data.masteredLessons === 1 ? "" : "s"} · {data.practiceCompleted} practice
                  task{data.practiceCompleted === 1 ? "" : "s"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <section>
            <h2 className="mb-4 text-xl font-black tracking-tight text-ink dark:text-white">Skill graph</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.skills.map((skill) => (
                <Card key={skill.category}>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="font-black text-ink dark:text-white">{skill.category}</h3>
                      <Badge>{skill.proficiency}%</Badge>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-brand-600 dark:bg-cyan-400"
                        style={{ width: `${Math.max(2, skill.proficiency)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                      {skill.completed} of {skill.total} books mastered
                    </p>
                    {skill.focusHref ? (
                      <Link
                        href={skill.focusHref}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-brand-700 hover:underline dark:text-cyan-300"
                      >
                        <PlayCircle className="size-4" /> Continue this path
                      </Link>
                    ) : (
                      <p className="mt-3 text-sm font-bold text-slate-400 dark:text-slate-500">Nothing in progress yet</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-black tracking-tight text-ink dark:text-white">Career path</h2>
            <ol className="space-y-5 border-l-2 border-slate-200 pl-5 dark:border-slate-800">
              {data.tracks.map((track) => (
                <li key={track.name} className="relative">
                  <span className="absolute -left-[27px] top-1.5 flex size-4 items-center justify-center rounded-full bg-white ring-2 ring-brand-500 dark:bg-slate-950" />
                  <Card>
                    <CardContent className="p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-black text-ink dark:text-white">{track.name}</h3>
                        <Badge>{track.progress}%</Badge>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-brand-600 dark:bg-cyan-400"
                          style={{ width: `${Math.max(2, track.progress)}%` }}
                        />
                      </div>
                      <ul className="mt-4 space-y-2.5">
                        {track.books.map((book) => {
                          const badge = statusBadge[book.status];
                          return (
                            <li key={book.slug}>
                              <Link
                                href={`/tutorials/${book.slug}`}
                                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  {book.status === "done" ? (
                                    <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                                  ) : book.status === "in-progress" ? (
                                    <PlayCircle className="size-5 shrink-0 text-brand-600 dark:text-cyan-300" />
                                  ) : (
                                    <Circle className="size-5 shrink-0 text-slate-300 dark:text-slate-600" />
                                  )}
                                  <span className="truncate font-black text-ink dark:text-white">{book.title}</span>
                                </span>
                                <span className="flex shrink-0 items-center gap-2">
                                  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${badge.className}`}>
                                    {badge.label}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">{book.progress}%</span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black tracking-tight text-ink dark:text-white">
              <Trophy className="size-5 text-brand-600 dark:text-cyan-300" /> Milestones
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.milestones.map((milestone) => (
                <Card
                  key={milestone.label}
                  className={milestone.done ? "border-emerald-200 dark:border-emerald-500/30" : ""}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    {milestone.done ? (
                      <CheckCircle2 className="size-6 shrink-0 text-emerald-500" />
                    ) : (
                      <Loader2 className="size-6 shrink-0 text-slate-300 dark:text-slate-600" />
                    )}
                    <span
                      className={
                        milestone.done
                          ? "font-black text-ink dark:text-white"
                          : "font-black text-slate-400 dark:text-slate-500"
                      }
                    >
                      {milestone.label}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
