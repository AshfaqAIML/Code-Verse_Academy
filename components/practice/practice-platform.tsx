"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Code2,
  FileQuestion,
  Flame,
  FolderKanban,
  Lock,
  PlayCircle,
  Search,
  Sparkles,
  Trophy,
  Upload,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PracticeTask, PracticeTaskType, PracticeTrack } from "@/lib/practice";

type PracticePlatformProps = {
  tracks: PracticeTrack[];
};

const tabs = [
  { label: "Practice", value: "practice" },
  { label: "Assignments", value: "project" },
  { label: "Quizzes", value: "mcq" },
  { label: "Coding", value: "coding" },
  { label: "Interview", value: "interview" },
  { label: "Resources", value: "reading" }
];

const typeMeta: Record<PracticeTaskType, { label: string; icon: LucideIcon; className: string }> = {
  mcq: { label: "Quiz", icon: FileQuestion, className: "bg-cyan-400/10 text-cyan-200 ring-cyan-300/20" },
  coding: { label: "Coding", icon: Code2, className: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20" },
  project: { label: "Project", icon: FolderKanban, className: "bg-amber-400/10 text-amber-100 ring-amber-300/20" },
  interview: { label: "Interview", icon: Users, className: "bg-rose-400/10 text-rose-100 ring-rose-300/20" },
  sql: { label: "SQL", icon: BarChart3, className: "bg-teal-400/10 text-teal-100 ring-teal-300/20" },
  dataset: { label: "Dataset", icon: ClipboardList, className: "bg-violet-400/10 text-violet-100 ring-violet-300/20" },
  reading: { label: "Reading", icon: BookOpen, className: "bg-slate-400/10 text-slate-100 ring-slate-300/20" }
};

const leaderboard = [
  { name: "Ayaan", score: 8920, badge: "React Sprint" },
  { name: "Meera", score: 8460, badge: "SQL Pro" },
  { name: "Kabir", score: 7980, badge: "Backend Builder" },
  { name: "You", score: 7640, badge: "Steady Learner" }
];

export function PracticePlatform({ tracks }: PracticePlatformProps) {
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id ?? "");
  const [selectedModuleId, setSelectedModuleId] = useState(tracks[0]?.modules[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState("practice");
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  const [submission, setSubmission] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? tracks[0],
    [selectedTrackId, tracks]
  );

  const selectedModule = useMemo(() => {
    if (!selectedTrack) return null;
    return selectedTrack.modules.find((module) => module.id === selectedModuleId) ?? selectedTrack.modules[0];
  }, [selectedModuleId, selectedTrack]);

  const allTasks = selectedTrack?.modules.flatMap((module) => module.tasks.map((task) => ({ ...task, moduleTitle: module.title }))) ?? [];
  const moduleTasks = selectedModule?.tasks.map((task) => ({ ...task, moduleTitle: selectedModule.title })) ?? allTasks;

  const taskPool = activeTab === "practice" ? moduleTasks : allTasks;
  const filteredTasks = taskPool.filter((task) => {
    const matchesTab =
      activeTab === "practice" ||
      task.type === activeTab ||
      (activeTab === "coding" && (task.type === "coding" || task.type === "sql" || task.type === "dataset")) ||
      (activeTab === "project" && (task.type === "project" || task.type === "dataset"));
    const haystack = `${task.title} ${task.prompt} ${task.moduleTitle}`.toLowerCase();
    return matchesTab && haystack.includes(query.toLowerCase());
  });

  const taskIdsForTrack = new Set(allTasks.map((task) => task.id));
  const completedForTrack = completed.filter((taskId) => taskIdsForTrack.has(taskId));
  const completedCount = completedForTrack.length + allTasks.filter((task) => task.status === "done").length;
  const totalTasks = Math.max(allTasks.length, 1);
  const liveProgress = Math.min(100, Math.round((completedCount / totalTasks) * 100));
  const xpEarned = completedForTrack.reduce((sum, taskId) => sum + (allTasks.find((task) => task.id === taskId)?.xp ?? 0), 0);

  function selectTrack(id: string) {
    const nextTrack = tracks.find((track) => track.id === id);
    setSelectedTrackId(id);
    setSelectedModuleId(nextTrack?.modules[0]?.id ?? "");
    setActiveTab("practice");
    setQuery("");
    setSubmittedMessage("");
  }

  function markTask(task: PracticeTask) {
    setCompleted((items) => (items.includes(task.id) ? items : [...items, task.id]));
  }

  function submitWork() {
    const wordCount = submission.trim().split(/\s+/).filter(Boolean).length;
    setSubmittedMessage(
      wordCount > 8
        ? "Submission saved. Your practice note is ready for mentor review."
        : "Add a few more details before final submission."
    );
  }

  if (!selectedTrack) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
        No practice tracks are available yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b16] text-white">
      <div className="mx-auto grid w-full max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[300px_minmax(0,1fr)_330px] lg:px-6">
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="border-b border-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">Practice classroom</p>
              <h1 className="mt-2 text-2xl font-black">All course batches</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">Practice sheets, assignments and interview drills for every uploaded course.</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {tracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => selectTrack(track.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition hover:border-cyan-300/50 hover:bg-white/[0.07] ${
                    selectedTrack.id === track.id ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{track.title}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">{track.category} · {track.level}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-black uppercase text-slate-300">
                      {track.source === "course" ? "Course" : "Book"}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full bg-gradient-to-r ${track.accent}`} style={{ width: `${track.progress}%` }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          <section className={`overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${selectedTrack.accent} p-px shadow-2xl shadow-black/30`}>
            <div className="rounded-[1.65rem] bg-[#0b1020]/92 p-5 md:p-7">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">{selectedTrack.category}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-200">{selectedTrack.lessons} lessons</span>
                  </div>
                  <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">{selectedTrack.title}</h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{selectedTrack.description}</p>
                </div>
                <div className="grid min-w-[260px] gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-300">Batch progress</span>
                    <span className="text-2xl font-black">{Math.max(selectedTrack.progress, liveProgress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className={`h-full rounded-full bg-gradient-to-r ${selectedTrack.accent}`} style={{ width: `${Math.max(selectedTrack.progress, liveProgress)}%` }} />
                  </div>
                  <button className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-100">
                    <PlayCircle className="size-4" />
                    Continue practice
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Learning streak", "21 days", Flame],
              ["XP earned", `${7640 + xpEarned}`, Trophy],
              ["Submissions", `${completedCount}/${totalTasks}`, Upload],
              ["Completion", `${liveProgress}%`, BadgeCheck]
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <Icon className="mb-4 size-5 text-cyan-200" />
                <p className="text-2xl font-black">{value as string}</p>
                <p className="text-sm font-bold text-slate-400">{label as string}</p>
              </div>
            ))}
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-black transition ${
                      activeTab === tab.value ? "bg-white text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-[#080d19] px-3 py-2 xl:w-80">
                <Search className="size-4 text-slate-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tasks..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-500"
                />
              </label>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
              <div className="space-y-2">
                {selectedTrack.modules.map((module) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => !module.locked && setSelectedModuleId(module.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      selectedModule?.id === module.id ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                    } ${module.locked ? "cursor-not-allowed opacity-55" : ""}`}
                  >
                    {module.locked ? <Lock className="size-4 text-slate-500" /> : <CircleDot className="size-4 text-cyan-200" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{module.title}</p>
                      <div className="mt-2 h-1 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-cyan-300" style={{ width: `${module.progress}%` }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#090f1d] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Current module</p>
                    <h3 className="mt-1 text-xl font-black">{selectedModule?.title ?? "Practice module"}</h3>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-200">
                    Daily challenge active
                  </span>
                </div>

                {filteredTasks.slice(0, 12).map((task) => {
                  const meta = typeMeta[task.type];
                  const Icon = meta.icon;
                  const isDone = completed.includes(task.id) || task.status === "done";

                  return (
                    <article key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/40 hover:bg-white/[0.06]">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ring-1 ${meta.className}`}>
                              <Icon className="size-3.5" />
                              {meta.label}
                            </span>
                            <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-black text-slate-300">{task.difficulty}</span>
                            <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-black text-slate-300">{task.duration}</span>
                          </div>
                          <h4 className="mt-3 text-lg font-black">{task.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{task.prompt}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-end">
                          <span className="text-sm font-black text-cyan-200">{task.xp} XP</span>
                          <button
                            type="button"
                            onClick={() => markTask(task)}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
                              isDone ? "bg-emerald-400/15 text-emerald-100" : "bg-white text-slate-950 hover:bg-cyan-100"
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="size-4" /> : <ChevronRight className="size-4" />}
                            {isDone ? "Done" : "Start"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <section className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
            <div className="flex items-center gap-2 text-cyan-100">
              <Sparkles className="size-5" />
              <p className="text-sm font-black uppercase tracking-[0.22em]">Today</p>
            </div>
            <h3 className="mt-3 text-2xl font-black">Daily challenge</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">Finish one quiz, one hands-on task and one interview explanation from this batch.</p>
            <div className="mt-4 grid gap-2">
              {["10 MCQs", "1 coding lab", "1 interview answer"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold">
                  <CheckCircle2 className="size-4 text-emerald-200" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-xl font-black">Submit work</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Paste your solution notes, repo link, SQL answer or project summary.</p>
            <textarea
              value={submission}
              onChange={(event) => setSubmission(event.target.value)}
              rows={6}
              className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-[#080d19] p-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
              placeholder="What did you build or solve?"
            />
            <button
              type="button"
              onClick={submitWork}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-100"
            >
              <Upload className="size-4" />
              Submit for review
            </button>
            {submittedMessage ? <p className="mt-3 rounded-xl bg-white/10 p-3 text-sm font-bold text-cyan-100">{submittedMessage}</p> : null}
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-xl font-black">Leaderboard</h3>
            <div className="mt-4 space-y-3">
              {leaderboard.map((student, index) => (
                <div key={student.name} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-sm font-black">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{student.name}</p>
                    <p className="truncate text-xs font-bold text-slate-400">{student.badge}</p>
                  </div>
                  <span className="text-sm font-black text-cyan-200">{student.score}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
