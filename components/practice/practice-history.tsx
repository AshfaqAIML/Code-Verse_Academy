"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, CalendarDays, CheckCircle2, History, Trophy } from "lucide-react";
import type { PracticeTrack } from "@/lib/practice";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

type Memory = { completed: string[]; practiceDates: string[] };

function readMemory(): Memory {
  if (typeof window === "undefined") return { completed: [], practiceDates: [] };
  try {
    const raw = window.localStorage.getItem("codeverse-practice-memory");
    if (!raw) return { completed: [], practiceDates: [] };
    const parsed = JSON.parse(raw) as Partial<Memory>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      practiceDates: Array.isArray(parsed.practiceDates) ? parsed.practiceDates : []
    };
  } catch {
    return { completed: [], practiceDates: [] };
  }
}

function streakOf(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  while (set.has(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const primaryLink =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-white dark:text-ink dark:ring-offset-slate-950 dark:hover:bg-slate-200";

export function PracticeHistory({ tracks }: { tracks: PracticeTrack[] }) {
  const [memory, setMemory] = useState<Memory | null>(null);

  useEffect(() => {
    setMemory(readMemory());
  }, []);

  const stats = useMemo(() => {
    if (!memory) return null;
    const byId = new Map<string, { title: string; xp: number; type: string; trackTitle: string }>();
    for (const track of tracks) {
      for (const mod of track.modules) {
        for (const task of mod.tasks) {
          byId.set(task.id, { title: task.title, xp: task.xp, type: task.type, trackTitle: track.title });
        }
      }
    }
    const uniqueDone = [...new Set(memory.completed)];
    const mapped = uniqueDone
      .map((id) => byId.get(id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t));
    const totalXp = mapped.reduce((sum, t) => sum + t.xp, 0);
    const byTrack = new Map<string, typeof mapped>();
    for (const t of mapped) {
      const list = byTrack.get(t.trackTitle) ?? [];
      list.push(t);
      byTrack.set(t.trackTitle, list);
    }
    const uniqueDates = [...new Set(memory.practiceDates)].sort();
    const last14: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      last14.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, count: uniqueDates.filter((k) => k === key).length });
    }
    return {
      completed: mapped.length,
      totalXp,
      activeDays: uniqueDates.length,
      streak: streakOf(memory.practiceDates),
      byTrack: [...byTrack.entries()].sort((a, b) => b[1].length - a[1].length),
      last14
    };
  }, [memory, tracks]);

  if (!memory) {
    return (
      <div className="grid gap-5 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  if (!stats || stats.completed === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<History className="size-6" />}
            title="No practice history yet"
            description="Complete a few practice tasks and they'll show up here — tasks completed, XP earned, and your daily activity."
            action={
              <Link href="/practice" className={primaryLink}>
                Start practicing
              </Link>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-xl font-black tracking-tight text-ink dark:text-white">Totals</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Tasks completed", value: String(stats.completed), icon: CheckCircle2 },
            { label: "XP earned", value: String(stats.totalXp), icon: Trophy },
            { label: "Active days", value: String(stats.activeDays), icon: CalendarDays },
            { label: "Current streak", value: `${stats.streak} day${stats.streak === 1 ? "" : "s"}`, icon: Award }
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-5">
                <Icon className="mb-4 size-6 text-brand-600 dark:text-cyan-300" />
                <p className="text-3xl font-black text-ink dark:text-white">{value}</p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-black tracking-tight text-ink dark:text-white">Last 14 days</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-7">
          {stats.last14.map((day) => (
            <div
              key={day.label}
              className={`flex h-14 items-end justify-center rounded-lg p-1 ${
                day.count > 0
                  ? "bg-emerald-100 dark:bg-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
              title={`${day.label} · ${day.count} task${day.count === 1 ? "" : "s"}`}
            >
              <span className={`text-[11px] font-black ${day.count > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-slate-400"}`}>
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-black tracking-tight text-ink dark:text-white">Completed by track</h2>
        <div className="space-y-4">
          {stats.byTrack.map(([trackTitle, tasks]) => (
            <Card key={trackTitle}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="font-black text-ink dark:text-white">{trackTitle}</h3>
                  <Badge>{tasks.length} completed</Badge>
                </div>
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li key={task.title + task.type} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <span className="flex min-w-0 items-center gap-2">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                        <span className="truncate font-bold text-ink dark:text-white">{task.title}</span>
                      </span>
                      <span className="shrink-0 text-xs font-black text-slate-400">{task.xp} XP</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}