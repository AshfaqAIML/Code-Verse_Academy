import { BadgeCheck, Flame, NotebookText, Trophy, Zap } from "lucide-react";
import { LearningChart, SkillChart } from "@/components/charts";
import { Section } from "@/components/section";
import { badges, courses } from "@/lib/data";
import { RevisionCenter } from "@/components/revision/revision-center";
import { getDashboardStats } from "@/lib/stats";
import StreakBoard from "@/components/streak-board/StreakBoard";

function StatCards() {
  const stats = getDashboardStats();
  const streakText = `${stats.streak} ${stats.streak === 1 ? "day" : "days"}`;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {[
        ["Learning streak", streakText, Flame],
        ["XP points", String(stats.xp), Zap],
        ["Completed lessons", String(stats.completed), BadgeCheck],
        ["Leaderboard", "#42", Trophy]
      ].map(([label, value, Icon]) => (
        <div key={label as string} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <Icon className="mb-5 size-7 text-brand-600" />
          <p className="text-3xl font-black">{value as string}</p>
          <p className="mt-1 text-sm font-bold text-slate-500">{label as string}</p>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Section eyebrow="Student dashboard" title="Your learning dashboard" copy="Track lessons, streaks, XP, saved notes, practice sheets, certificates and recently viewed classes in one place.">
      <StatCards />
      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-xl font-black">Weekly activity</h3>
              <LearningChart />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-xl font-black">Skill profile</h3>
              <SkillChart />
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
              <h3 className="mb-4 text-xl font-black">Recently viewed</h3>
              <div className="space-y-3">
                {courses.slice(0, 4).map((course) => (
                  <div key={course.slug} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                    <div>
                      <p className="font-black">{course.title}</p>
                      <p className="text-sm text-slate-500">{course.chapters[0]} lesson</p>
                    </div>
                    <span className="text-sm font-black text-brand-700 dark:text-cyan-300">{course.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-xl font-black">Badges</h3>
              <div className="space-y-3">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                      <Icon className="size-5 text-leaf" />
                      <span className="font-bold">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
                <NotebookText className="mb-3 size-5 text-brand-600" />
                <p className="font-black">Saved note</p>
                <p className="mt-1 text-sm text-slate-500">Normalize SQL tables before adding analytics joins.</p>
              </div>
            </div>
          </div>
          <RevisionCenter />
        </div>
        <div className="xl:sticky xl:top-24 xl:self-start">
          <StreakBoard />
        </div>
      </div>
    </Section>
  );
}
