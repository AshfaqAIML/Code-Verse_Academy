"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Flame, Medal, Trophy } from "lucide-react";
import { getDashboardStats, getMonthActivity } from "@/lib/stats";
import type { DashboardStats, MonthActivity } from "@/lib/stats";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

const LEADERBOARD = [
  { rank: 1, name: "Suman Jana", hours: 1710 },
  { rank: 2, name: "Prateek Vasanth", hours: 469 },
  { rank: 3, name: "Harsh Dwivedi", hours: 421 },
  { rank: 4, name: "Md Asad Hussain", hours: 406 },
  { rank: 5, name: "Amit", hours: 397 },
  { rank: 6, name: "Giriraj Ramesh More", hours: 380 },
  { rank: 7, name: "Shreevidya T S", hours: 350 },
  { rank: 8, name: "patel sagar", hours: 349 },
  { rank: 9, name: "Sagar Singh", hours: 340 },
  { rank: 10, name: "Abhay Singh", hours: 328 },
];

export default function StreakBoard() {
  const [stats, setStats] = useState<DashboardStats>({ streak: 0, longestStreak: 0, xp: 0, completed: 0 });
  const [activity, setActivity] = useState<MonthActivity>({ year: 2026, month: 1, days: [] });
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [leaderboardTab, setLeaderboardTab] = useState<"weekly" | "overall">("overall");

  useEffect(() => {
    setStats(getDashboardStats());
    setActivity(getMonthActivity(viewYear, viewMonth));
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const today = new Date();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-2">
          <Flame className="size-6 text-orange-500" />
          <h3 className="text-lg font-black">Streak</h3>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 text-center dark:from-orange-950/30 dark:to-amber-950/30">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Learning Streak!
            </p>
            <p className="mt-1 text-4xl font-black text-slate-900 dark:text-white">{stats.streak}</p>
            <p className="text-sm font-bold text-slate-500">Days</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 p-4 text-center dark:from-rose-950/30 dark:to-pink-950/30">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Longest Streak!
            </p>
            <p className="mt-1 text-4xl font-black text-slate-900 dark:text-white">{stats.longestStreak}</p>
            <p className="text-sm font-bold text-slate-500">Days</p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <button onClick={prevMonth} className="rounded-lg p-1.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300">
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-black">
            {MONTHS[viewMonth - 1]} {viewYear}
          </span>
          <button onClick={nextMonth} className="rounded-lg p-1.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300">
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="py-1 text-slate-400">{d}</div>
          ))}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {activity.days.map((day) => {
            const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1 && day.date === today.getDate();
            return (
              <div
                key={day.date}
                className={`rounded-lg py-1.5 text-sm font-bold transition ${
                  day.active
                    ? "bg-orange-500 text-white shadow-sm"
                    : isToday
                    ? "border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300"
                    : "text-slate-400"
                }`}
              >
                {day.date}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-2">
          <Trophy className="size-6 text-amber-500" />
          <h3 className="text-lg font-black">Leaderboard</h3>
        </div>

        <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(["weekly", "overall"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setLeaderboardTab(tab)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold capitalize transition ${
                leaderboardTab === tab
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {LEADERBOARD.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                {entry.rank <= 3 ? (
                  <Medal className={`size-5 ${
                    entry.rank === 1 ? "text-amber-400" : entry.rank === 2 ? "text-slate-400" : "text-amber-700"
                  }`} />
                ) : (
                  <span className="w-5 text-center text-xs font-bold text-slate-400">#{entry.rank}</span>
                )}
                <span className="text-sm font-bold">{entry.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <Clock className="size-3.5" />
                {entry.hours} hr
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-gradient-to-r from-slate-50 to-amber-50/50 p-4 dark:border-slate-700 dark:from-slate-800 dark:to-amber-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-xs font-black text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                #3475
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Rank!</p>
                <p className="text-sm font-black">Ishfaq Dar</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
              <Clock className="size-4" />
              45 hr
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
