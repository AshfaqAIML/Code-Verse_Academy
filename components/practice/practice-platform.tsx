"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Code2,
  FileQuestion,
  Flame,
  FolderKanban,
  HelpCircle,
  Lock,
  Maximize,
  PanelRight,
  PlayCircle,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
  Upload,
  Users,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PracticeTask, PracticeTaskType, PracticeTrack } from "@/lib/practice";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const SQLSandbox = dynamic(() => import("@/components/playground-ide/sql-sandbox"), { ssr: false });

type PracticePlatformProps = {
  tracks: PracticeTrack[];
};

type PracticeTaskWithModule = PracticeTask & {
  moduleTitle: string;
};

type PracticeMemory = {
  completed: string[];
  practiceDates: string[];
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
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

const memoryKey = "codeverse-practice-memory";

const confettiPieces = Array.from({ length: 95 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 12) * 0.08}s`,
  duration: `${2.2 + (index % 8) * 0.16}s`,
  color: ["#63d94f", "#dd36d8", "#21b9df", "#f2d84e", "#ef6a8a", "#f19b28", "#8b5cf6"][index % 7],
  width: `${6 + (index % 5) * 2}px`,
  height: `${10 + (index % 4) * 3}px`,
  rotate: `${(index * 29) % 180}deg`
}));

function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function calculateStreak(practiceDates: string[]) {
  const dates = new Set(practiceDates);
  let streak = 0;
  const cursor = new Date();

  while (dates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function readPracticeMemory(): PracticeMemory {
  if (typeof window === "undefined") {
    return { completed: [], practiceDates: [] };
  }

  try {
    const memory = JSON.parse(window.localStorage.getItem(memoryKey) ?? "{}") as Partial<PracticeMemory>;
    return {
      completed: Array.isArray(memory.completed) ? memory.completed : [],
      practiceDates: Array.isArray(memory.practiceDates) ? memory.practiceDates : []
    };
  } catch {
    return { completed: [], practiceDates: [] };
  }
}

function quizForTask(task: PracticeTaskWithModule): QuizQuestion[] {
  return [
    {
      question: `What should you understand first in ${task.moduleTitle}?`,
      options: ["The main concept and use case", "Only the final answer", "Only the tool name", "Nothing before coding"],
      answer: 0,
      explanation: `Start by understanding the concept, why it exists, and where it is used. That makes the practice task easier to solve.`,
      difficulty: "medium"
    },
    {
      question: `Which activity best proves practice for ${task.title}?`,
      options: ["Skipping examples", "Applying it in a small task", "Changing the topic", "Reading only headings"],
      answer: 1,
      explanation: `Practice is proven by applying the idea in a small working task, not by only reading or memorizing.`,
      difficulty: "easy"
    },
    {
      question: "What should you do after making a mistake?",
      options: ["Ignore it", "Copy a solution silently", "Write the reason and retry", "Stop the course"],
      answer: 2,
      explanation: `Writing the reason for a mistake helps you avoid repeating it and builds interview-ready clarity.`,
      difficulty: "easy"
    }
  ];
}

export function PracticePlatform({ tracks }: PracticePlatformProps) {
  const searchParams = useSearchParams();
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id ?? "");
  const [selectedModuleId, setSelectedModuleId] = useState(tracks[0]?.modules[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState("practice");
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [activeTask, setActiveTask] = useState<PracticeTaskWithModule | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [workspaceText, setWorkspaceText] = useState("");
  const [submission, setSubmission] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const memory = readPracticeMemory();
    setCompleted(memory.completed);
    setStreak(calculateStreak(memory.practiceDates));
  }, []);

  useEffect(() => {
    const trackParam = searchParams.get("track");
    if (!trackParam) return;
    const match = tracks.find((track) => track.id === trackParam);
    if (match) {
      setSelectedTrackId(match.id);
      setSelectedModuleId(match.modules[0]?.id ?? "");
    }
  }, [searchParams, tracks]);

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? tracks[0],
    [selectedTrackId, tracks]
  );

  const deepLinkedTrackId = searchParams.get("track");
  const returningToBook = Boolean(deepLinkedTrackId && selectedTrack?.source === "tutorial-book");

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
    setActiveTask(null);
  }

  function openTask(task: PracticeTaskWithModule) {
    setActiveTask(task);
    setAnswers({});
    setSubmittedQuestions([]);
    setCurrentQuestionIndex(0);
    setShowCelebration(false);
    setWorkspaceText("");
    setSubmittedMessage("");
    setToast("");
  }

  function openNextTask() {
    const nextTask =
      allTasks.find((task) => task.type === "mcq" && !completed.includes(task.id)) ??
      allTasks.find((task) => !completed.includes(task.id)) ??
      allTasks[0];
    if (nextTask) {
      openTask(nextTask);
    }
  }

  function completeTask(task: PracticeTaskWithModule) {
    setCompleted((items) => {
      const nextCompleted = items.includes(task.id) ? items : [...items, task.id];
      const memory = readPracticeMemory();
      const nextPracticeDates = Array.from(new Set([...memory.practiceDates, dateKey()]));
      const nextStreak = calculateStreak(nextPracticeDates);

      window.localStorage.setItem(
        memoryKey,
        JSON.stringify({
          completed: nextCompleted,
          practiceDates: nextPracticeDates
        })
      );
      setStreak(nextStreak);
      return nextCompleted;
    });
  }

  function submitMcqAnswer() {
    if (!activeTask || activeTask.type !== "mcq") return;
    const quiz = quizForTask(activeTask);
    const question = quiz[currentQuestionIndex];
    const selected = answers[currentQuestionIndex];

    if (typeof selected !== "number") {
      setToast("Choose one option before submitting.");
      return;
    }

    setSubmittedQuestions((items) => (items.includes(currentQuestionIndex) ? items : [...items, currentQuestionIndex]));

    if (selected === question.answer) {
      completeTask(activeTask);
      setToast("MCQ answer submitted successfully");
      setShowCelebration(true);
      window.setTimeout(() => setShowCelebration(false), 2800);
    } else {
      setToast("Try again. Read the explanation and choose carefully.");
    }
  }

  function handleSqlSave(query: string) {
    setWorkspaceText(query);
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

  if (activeTask?.type === "mcq") {
    const quiz = quizForTask(activeTask);
    const currentQuestion = quiz[currentQuestionIndex];
    const selectedOption = answers[currentQuestionIndex];
    const isSubmitted = submittedQuestions.includes(currentQuestionIndex);
    const correct = isSubmitted && selectedOption === currentQuestion.answer;
    const mcqProgress = Math.round((submittedQuestions.length / quiz.length) * 100);

    return (
      <div className="min-h-screen overflow-hidden bg-[#101010] text-white">
        <style jsx>{`
          @keyframes confetti-shower {
            0% {
              opacity: 0;
              transform: translate3d(0, -12vh, 0) rotate(0deg);
            }
            12% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translate3d(var(--drift), 88vh, 0) rotate(760deg);
            }
          }
        `}</style>

        {showCelebration ? (
          <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="absolute top-0 rounded-sm"
                style={{
                  left: piece.left,
                  width: piece.width,
                  height: piece.height,
                  background: piece.color,
                  transform: `rotate(${piece.rotate})`,
                  animation: `confetti-shower ${piece.duration} linear ${piece.delay} forwards`,
                  ["--drift" as string]: `${piece.id % 2 === 0 ? "" : "-"}${24 + (piece.id % 9) * 9}px`
                }}
              />
            ))}
          </div>
        ) : null}

        {toast ? (
          <div className={`fixed right-5 top-8 z-[80] rounded-lg px-5 py-3 text-sm font-bold shadow-2xl ${
            toast.includes("successfully") ? "bg-[#58c83c] text-white" : "bg-orange-600 text-white"
          }`}>
            {toast}
          </div>
        ) : null}

        <header className="flex h-[104px] items-center justify-between border-b border-white/15 bg-[#181818] px-5 md:px-9">
          <div className="flex items-center gap-4">
            <div className="grid size-11 place-items-center rounded-xl bg-white text-[#181818]">
              <Code2 className="size-7" />
            </div>
            <div className="border-l border-white/40 pl-5">
              <p className="text-2xl font-black leading-6">CodeVerse</p>
              <p className="text-2xl font-black leading-6">Academy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-[#243bff] text-lime-300">
              <CircleDot className="size-8 fill-current" />
            </div>
            <ChevronRight className="size-5 rotate-90 text-white" />
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-104px)] grid-cols-[76px_minmax(0,1fr)] gap-3 p-4 md:grid-cols-[76px_minmax(0,1fr)]">
          <aside className="flex flex-col items-center rounded-xl border border-white/10 bg-[#181818] py-4">
            <button
              type="button"
              onClick={() => setActiveTask(null)}
              className="grid size-14 place-items-center rounded-xl border border-white/10 bg-[#252525] text-white transition hover:bg-[#303030]"
              aria-label="Back to practice classroom"
            >
              <ArrowLeft className="size-7" />
            </button>
            <div className="mt-5 grid w-full place-items-center border-y border-white/5 py-4">
              <button className="grid size-9 place-items-center rounded bg-[#2b2b33] text-slate-200">
                <ChevronRight className="size-5" />
              </button>
              <p className="mt-4 text-sm font-bold">{mcqProgress}%</p>
              <div className="mt-2 h-1.5 w-10 rounded-full bg-white/20">
                <div className="h-full rounded-full bg-[#d65a2b]" style={{ width: `${mcqProgress}%` }} />
              </div>
            </div>
            <div className="mt-5 flex flex-1 flex-col items-center gap-3 rounded-xl bg-[#242424] p-2">
              <button className="grid size-10 place-items-center rounded-lg bg-[#33333d] text-white">
                <BookOpen className="size-6" />
              </button>
              {quiz.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`grid size-10 place-items-center rounded-lg border text-sm font-black ${
                    index === currentQuestionIndex
                      ? "border-[#d65a2b] bg-[#3a3a42] text-white"
                      : submittedQuestions.includes(index)
                        ? "border-[#58c83c]/60 bg-[#153315] text-[#58c83c]"
                        : "border-white/10 bg-[#242424] text-slate-500"
                  }`}
                >
                  <HelpCircle className="size-5" />
                </button>
              ))}
              <button className="mt-auto grid size-10 place-items-center rounded-lg bg-[#242424] text-slate-400">
                <PanelRight className="size-5" />
              </button>
            </div>
          </aside>

          <main className="grid min-w-0 gap-3 lg:grid-cols-[0.78fr_1.22fr]">
            <section className="min-h-[calc(100vh-136px)] rounded-xl border border-white/10 bg-[#181818]">
              <div className="flex h-16 items-center justify-between rounded-t-xl bg-[#242424] px-7">
                <div className="flex items-center gap-3">
                  <FileQuestion className="size-6 text-[#d65a2b]" />
                  <p className="text-xl font-bold">MCQ&apos;s</p>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <Bookmark className="size-6 text-[#d65a2b]" />
                  <Maximize className="size-6" />
                </div>
              </div>
              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-medium tracking-tight">{activeTask.moduleTitle}</h1>
                    <span className="mt-3 inline-flex rounded-full border border-[#d88420] px-4 py-1 text-sm font-black text-[#ffb13b]">
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  {completed.includes(activeTask.id) ? (
                    <div className="flex items-center gap-2 text-[#58c83c]">
                      <span className="font-bold">Completed</span>
                      <CheckCircle2 className="size-6" />
                    </div>
                  ) : null}
                </div>

                <p className="mt-7 max-w-2xl text-xl leading-8 text-white">{currentQuestion.question}</p>
              </div>
            </section>

            <section className="min-h-[calc(100vh-136px)] rounded-xl border border-white/10 bg-[#181818]">
              <div className="flex h-16 items-center justify-between rounded-t-xl bg-[#242424] px-7">
                <p className="text-lg font-bold">
                  Options: <span className="ml-1 text-base font-medium text-[#666985]">Choose the correct option</span>
                </p>
                <div className="flex items-center gap-5">
                  <p className="font-bold">Attempts {submittedQuestions.length}/{quiz.length}</p>
                  <Maximize className="size-6 text-slate-400" />
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-4">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const selected = selectedOption === optionIndex;
                    const isCorrect = isSubmitted && optionIndex === currentQuestion.answer;
                    const isWrong = isSubmitted && selected && optionIndex !== currentQuestion.answer;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          if (!isSubmitted) {
                            setAnswers((items) => ({ ...items, [currentQuestionIndex]: optionIndex }));
                          }
                        }}
                        className={`flex min-h-14 w-full items-center gap-4 rounded-lg border px-4 text-left text-lg transition ${
                          isCorrect
                            ? "border-[#58c83c] bg-[#102110] text-[#58c83c]"
                            : isWrong
                              ? "border-[#e35757] bg-[#2a1515] text-[#ff8a8a]"
                              : selected
                                ? "border-[#d65a2b] bg-[#211913] text-white"
                                : "border-[#5b5b5b] bg-[#171717] text-[#696969] hover:border-[#d65a2b] hover:text-white"
                        }`}
                      >
                        <span className={`size-6 rounded-full border-2 ${
                          isCorrect
                            ? "border-[#58c83c] bg-[#58c83c] shadow-[inset_0_0_0_5px_#171717]"
                            : selected
                              ? "border-[#d65a2b] bg-[#d65a2b] shadow-[inset_0_0_0_5px_#171717]"
                              : "border-[#666]"
                        }`} />
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={submitMcqAnswer}
                    disabled={isSubmitted && correct}
                    className="rounded bg-[#d45a2d] px-8 py-3 text-xl font-medium text-white transition hover:bg-[#eb6534] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitted ? "Submitted" : "Submit"}
                  </button>
                </div>

                {isSubmitted ? (
                  <div className="mt-7">
                    <p className={`text-2xl font-medium ${correct ? "text-[#58c83c]" : "text-[#ff7777]"}`}>
                      {correct ? "Correct answer!" : "Incorrect answer"}
                    </p>
                    <div className="mt-5 rounded-xl bg-[#222229] p-5">
                      <p className="text-xl font-medium">Explanation:</p>
                      <p className="mt-3 text-lg leading-7 text-[#a0a4d0]">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </main>
        </div>

        <footer className="fixed bottom-3 left-0 right-0 z-40 flex justify-center gap-20 pointer-events-none">
          <button
            type="button"
            onClick={() => setCurrentQuestionIndex((value) => Math.max(0, value - 1))}
            className="pointer-events-auto grid size-12 place-items-center rounded-lg border border-white/15 bg-[#202028] text-[#d65a2b] disabled:opacity-40"
            disabled={currentQuestionIndex === 0}
            aria-label="Previous lesson"
          >
            <ChevronLeft className="size-6" />
          </button>
          <div className="pointer-events-auto grid h-12 w-44 place-items-center rounded-lg border border-white/15 bg-[#202028] text-lg font-bold text-slate-300">
            Lesson {currentQuestionIndex + 1}/{quiz.length}
          </div>
          <button
            type="button"
            onClick={() => setCurrentQuestionIndex((value) => Math.min(quiz.length - 1, value + 1))}
            className="pointer-events-auto grid size-12 place-items-center rounded-lg border border-white/15 bg-[#202028] text-[#d65a2b] disabled:opacity-40"
            disabled={currentQuestionIndex === quiz.length - 1}
            aria-label="Next lesson"
          >
            <ChevronRight className="size-6" />
          </button>
        </footer>
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
            <div className="rounded-[1.65rem] bg-[#0b1020]/94 p-5 md:p-7">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">{selectedTrack.category}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-200">{selectedTrack.lessons} lessons</span>
                    {returningToBook && deepLinkedTrackId ? (
                      <Link
                        href={`/tutorials/${deepLinkedTrackId}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-cyan-100 transition hover:bg-white/20"
                      >
                        <ArrowLeft className="size-3.5" />
                        Back to tutorial
                      </Link>
                    ) : null}
                  </div>
                  <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">{selectedTrack.title}</h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{selectedTrack.description}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-300">Batch progress</span>
                    <span className="text-2xl font-black">{Math.max(selectedTrack.progress, liveProgress)}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className={`h-full rounded-full bg-gradient-to-r ${selectedTrack.accent}`} style={{ width: `${Math.max(selectedTrack.progress, liveProgress)}%` }} />
                  </div>
                  <button
                    type="button"
                    onClick={openNextTask}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-100"
                  >
                    <PlayCircle className="size-4" />
                    Continue practice
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Learning streak", `${streak} ${streak === 1 ? "day" : "days"}`, Flame],
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

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#090f1d] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Current module</p>
                    <h3 className="mt-1 text-xl font-black">{selectedModule?.title ?? "Practice module"}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Use the horizontal modules below to move through the batch, then open any task in the main workspace.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-200">
                    {selectedModule?.tasks.length ?? 0} tasks in view
                  </span>
                </div>

                <div className="mt-4 overflow-x-auto pb-1">
                  <div className="flex min-w-max gap-2">
                    {selectedTrack.modules.map((module) => (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => !module.locked && setSelectedModuleId(module.id)}
                        className={`flex w-[220px] items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          selectedModule?.id === module.id ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                        } ${module.locked ? "cursor-not-allowed opacity-55" : ""}`}
                      >
                        {module.locked ? <Lock className="size-4 shrink-0 text-slate-500" /> : <CircleDot className="size-4 shrink-0 text-cyan-200" />}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black">{module.title}</p>
                          <div className="mt-2 h-1 rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${module.progress}%` }} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {filteredTasks.slice(0, 12).map((task) => {
                  const meta = typeMeta[task.type];
                  const Icon = meta.icon;
                  const isDone = completed.includes(task.id) || task.status === "done";

                  return (
                    <article key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.06]">
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
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{task.prompt}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-end">
                          <span className="text-sm font-black text-cyan-200">{task.xp} XP</span>
                          <button
                            type="button"
                            onClick={() => openTask(task)}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
                              isDone ? "bg-emerald-400/15 text-emerald-100" : "bg-white text-slate-950 hover:bg-cyan-100"
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="size-4" /> : <ChevronRight className="size-4" />}
                            {isDone ? "Review" : "Start"}
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

      {activeTask ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6 backdrop-blur-md">
          <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[1.5rem] border border-white/10 bg-[#0b1020] shadow-2xl shadow-black/50">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0b1020]/95 p-5 backdrop-blur">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">{typeMeta[activeTask.type].label} workspace</p>
                <h3 className="mt-2 text-2xl font-black">{activeTask.title}</h3>
                <p className="mt-1 text-sm font-bold text-slate-400">{activeTask.moduleTitle} · {activeTask.duration} · {activeTask.xp} XP</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTask(null)}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-slate-200 transition hover:bg-white/15"
                aria-label="Close practice workspace"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Task brief</p>
                  <p className="mt-3 text-base leading-7 text-slate-200">{activeTask.prompt}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <label className="text-sm font-black uppercase tracking-[0.18em] text-slate-400" htmlFor="practice-workspace">
                    {activeTask.type === "sql" ? "SQL Workspace" : "Your answer"}
                  </label>
                  {activeTask.type === "sql" ? (
                    <div className="mt-3 h-[350px]">
                      <SQLSandbox onSave={handleSqlSave} />
                    </div>
                  ) : (
                    <textarea
                      id="practice-workspace"
                      value={workspaceText}
                      onChange={(event) => setWorkspaceText(event.target.value)}
                      rows={10}
                      className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-[#080d19] p-4 font-mono text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
                      placeholder={
                        activeTask.type === "coding"
                          ? "Write your solution, code, or explanation here..."
                          : "Write your project notes, interview answer, or revision summary here..."
                      }
                    />
                  )}
                </div>
              </div>

              <aside className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-black text-slate-400">Completion status</p>
                  <p className="mt-2 text-3xl font-black">{workspaceText.trim().split(/\s+/).filter(Boolean).length}</p>
                  <p className="text-sm font-bold text-slate-400">words written</p>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <p className="text-sm font-black text-cyan-100">Real streak rule</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Your streak increases when you complete at least one practice task on a new day in this browser.</p>
                </div>
                <button
                  type="button"
                  onClick={() => completeTask(activeTask)}
                  disabled={activeTask.type === "sql" ? workspaceText.trim().length < 5 : workspaceText.trim().length < 20}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-slate-500"
                >
                  <CheckCircle2 className="size-4" />
                  Complete task
                </button>
                {completed.includes(activeTask.id) ? (
                  <p className="rounded-xl bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100">This task is already completed. You can review it anytime.</p>
                ) : null}
              </aside>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
