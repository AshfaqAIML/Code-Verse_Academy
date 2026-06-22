"use client";

import { Bot, BrainCircuit, Download, FileText, Layers3, Loader2, Save, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { exportRevision } from "@/lib/revision/export";
import { RevisionMode, RevisionSummary } from "@/lib/revision/types";

type Props = {
  topic: string;
  chapterTitle: string;
  learningPath?: string;
  content: string;
  previousChapters?: Array<{
    number: number;
    slug: string;
    title: string;
    content: string;
  }>;
};

const modeLabels: Record<RevisionMode, string> = {
  quick: "Quick Revision",
  smart: "Smart Notes",
  deep: "Deep Revision"
};

export function RevisionAssistant({ topic, chapterTitle, learningPath, content, previousChapters = [] }: Props) {
  const [mode, setMode] = useState<RevisionMode>("quick");
  const [summary, setSummary] = useState<RevisionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exitPrompt, setExitPrompt] = useState(false);
  const [exitPromptDismissed, setExitPromptDismissed] = useState(false);
  const [error, setError] = useState("");
  const [streakDay, setStreakDay] = useState("1");
  const [selectedChapters, setSelectedChapters] = useState<string[]>(() => previousChapters.slice(-3).map((chapter) => chapter.slug));
  const [warmupDismissed, setWarmupDismissed] = useState(false);

  const memory = useMemo(() => readMemory(), []);
  const exitPromptKey = useMemo(() => `codeverse-revision-exit-dismissed:${topic}:${chapterTitle}`, [topic, chapterTitle]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setExitPromptDismissed(window.localStorage.getItem(exitPromptKey) === "1");
  }, [exitPromptKey]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!summary && content.length > 200 && !exitPromptDismissed) {
        event.preventDefault();
        event.returnValue = "Generate revision notes before leaving?";
      }
    };
    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0 && !summary && !exitPromptDismissed) {
        setExitPrompt(true);
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [summary, content.length, exitPromptDismissed]);

  async function generate(nextMode = mode, override?: { title?: string; body?: string; completedTopics?: string[] }) {
    setOpen(true);
    setExitPrompt(false);
    setLoading(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch("/api/ai/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          chapterTitle: override?.title || chapterTitle,
          learningPath,
          mode: nextMode,
          content: override?.body || content || `${chapterTitle} ${topic}`,
          completedTopics: override?.completedTopics || memory.completedTopics || [],
          weakConcepts: memory.weakConcepts || [],
          quizScores: memory.quizScores || []
        })
      });
      const data = await response.json();
      if (!response.ok || !data.summary) {
        throw new Error(data.error || "Could not generate revision summary.");
      }
      setSummary(data.summary);
      writeMemory(topic, chapterTitle, data.summary);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate revision summary.");
    } finally {
      setLoading(false);
    }
  }

  function togglePreviousChapter(slug: string) {
    setSelectedChapters((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  }

  function generatePreviousSummary() {
    const selected = previousChapters.filter((chapter) => selectedChapters.includes(chapter.slug));
    const body = selected.length
      ? selected.map((chapter) => `Chapter ${chapter.number}: ${chapter.title}\n${chapter.content}`).join("\n\n")
      : content;
    generate("quick", {
      title: `Streak day ${streakDay || "1"} warm-up before ${chapterTitle}`,
      body,
      completedTopics: selected.map((chapter) => `${topic}: ${chapter.title}`)
    });
  }

  function proceedWithoutSummary() {
    setWarmupDismissed(true);
    setExitPrompt(false);
    setExitPromptDismissed(true);
    if (typeof window === "undefined") return;
    const memory = readMemory();
    window.localStorage.setItem(exitPromptKey, "1");
    window.localStorage.setItem(
      "codeverse-learning-memory",
      JSON.stringify({ ...memory, skippedWarmupFor: chapterTitle, lastStudiedAt: new Date().toISOString() })
    );
  }

  async function saveSummary() {
    if (!summary) return;
    const current = JSON.parse(window.localStorage.getItem("codeverse-revision-summaries") || "[]");
    window.localStorage.setItem("codeverse-revision-summaries", JSON.stringify([summary, ...current].slice(0, 30)));
    await fetch("/api/revision/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(summary)
    }).catch(() => undefined);
    setSaved(true);
  }

  return (
    <>
      {!warmupDismissed && previousChapters.length ? (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-700 dark:text-cyan-200">Before this chapter</p>
              <h3 className="mt-2 text-2xl font-black">Review earlier reading for today</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Pick chapters from your previous reading streak, then let the AI summarize them before you start. You can also continue without a recap.
              </p>
            </div>
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:max-w-md">
              <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-500" htmlFor="revision-streak-day">
                Streak day
              </label>
              <input
                id="revision-streak-day"
                value={streakDay}
                onChange={(event) => setStreakDay(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-950"
                inputMode="numeric"
              />
              <div className="mt-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Chapters read</p>
                <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                  {previousChapters.map((chapter) => (
                    <button
                      type="button"
                      key={chapter.slug}
                      onClick={() => togglePreviousChapter(chapter.slug)}
                      className={`rounded-full px-3 py-1.5 text-sm font-black transition ${
                        selectedChapters.includes(chapter.slug)
                          ? "bg-ink text-white dark:bg-white dark:text-ink"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-950 dark:text-slate-300"
                      }`}
                      title={chapter.title}
                    >
                      {chapter.number}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={generatePreviousSummary}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-black text-white dark:bg-white dark:text-ink"
                >
                  <Sparkles className="size-4" /> Summarize selected
                </button>
                <button
                  type="button"
                  onClick={proceedWithoutSummary}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 dark:border-slate-800 dark:text-slate-300"
                >
                  Proceed without summary
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-900 dark:bg-cyan-950/30">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-brand-700 dark:text-cyan-200">AI Revision Assistant</p>
            <h3 className="mt-2 text-2xl font-black">Generate revision notes before moving on</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Uses this lesson, your local learning memory, completed topics and weak concepts to create a personalized revision set.
            </p>
          </div>
          <button
            onClick={() => generate()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-ink"
          >
            <Sparkles className="size-4" /> Generate AI Revision Summary
          </button>
        </div>
      </section>

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-black text-white shadow-2xl dark:bg-white dark:text-ink"
      >
        <Bot className="size-5" /> AI Revision
      </button>

      {(open || exitPrompt) && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-600">Agentic revision</p>
                <h2 className="text-2xl font-black">{exitPrompt ? "Generate revision notes before leaving?" : chapterTitle}</h2>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setExitPrompt(false);
                  setExitPromptDismissed(true);
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem(exitPromptKey, "1");
                  }
                }}
                className="rounded-xl border border-slate-200 p-2 dark:border-slate-800"
                aria-label="Close revision assistant"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-5 flex flex-wrap gap-2">
                {(Object.keys(modeLabels) as RevisionMode[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setMode(item);
                      generate(item);
                    }}
                    className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                      mode === item ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {modeLabels[item]}
                  </button>
                ))}
              </div>

              {error ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              ) : null}

              {loading ? (
                <div className="grid min-h-72 place-items-center rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-4 size-9 animate-spin text-brand-600" />
                    <p className="font-black">AI agent is building your revision flow...</p>
                  </div>
                </div>
              ) : summary ? (
                <SummaryView summary={summary} onSave={saveSummary} saved={saved} />
              ) : (
                <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-900">
                  <p className="font-black">Choose a mode to generate revision notes.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {["Quick Summary", "Detailed Notes", "Flashcards", "Interview Notes", "Export as PDF", "Save to Dashboard"].map((item) => (
                      <button key={item} onClick={() => generate()} className="rounded-xl border border-slate-200 bg-white p-4 text-left font-bold dark:border-slate-800 dark:bg-slate-950">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SummaryView({ summary, onSave, saved }: { summary: RevisionSummary; onSave: () => void; saved: boolean }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={BrainCircuit} title="Key Concepts" items={summary.keyConcepts} />
        <SummaryCard icon={Layers3} title="Interview Points" items={summary.interviewPoints} />
        <SummaryCard icon={FileText} title="Next Steps" items={summary.nextSteps} />
      </div>

      <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
        <h3 className="text-xl font-black">Revision Notes</h3>
        <div className="mt-4 space-y-3">
          {summary.mediumNotes.map((note) => (
            <p key={note} className="rounded-xl bg-slate-50 p-4 leading-7 text-slate-700 dark:bg-slate-900 dark:text-slate-300">{note}</p>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <h3 className="text-xl font-black">Flashcards</h3>
          <div className="mt-4 space-y-3">
            {summary.flashcards.slice(0, 5).map((card) => (
              <details key={card.front} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <summary className="cursor-pointer font-black">{card.front}</summary>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{card.back}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <h3 className="text-xl font-black">MCQ Revision</h3>
          <div className="mt-4 space-y-3">
            {summary.mcqs.slice(0, 4).map((mcq) => (
              <details key={mcq.question} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                <summary className="cursor-pointer font-black">{mcq.question}</summary>
                <p className="mt-3 text-sm text-slate-500">Answer: {mcq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={onSave} className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-ink">
          <Save className="size-4" /> {saved ? "Saved" : "Save to Dashboard"}
        </button>
        {(["pdf", "docx", "markdown", "text"] as const).map((format) => (
          <button key={format} onClick={() => exportRevision(summary, format)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-slate-800">
            <Download className="size-4" /> {format.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, items }: { icon: typeof Bot; title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <Icon className="mb-5 size-6 text-brand-600" />
      <h3 className="font-black">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {items.slice(0, 5).map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function readMemory() {
  if (typeof window === "undefined") {
    return { completedTopics: [], weakConcepts: [], quizScores: [] };
  }
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem("codeverse-learning-memory") ||
        JSON.stringify({ completedTopics: [], weakConcepts: ["definitions", "code examples"], quizScores: [] })
    );
    return {
      completedTopics: Array.isArray(parsed.completedTopics) ? parsed.completedTopics : [],
      weakConcepts: Array.isArray(parsed.weakConcepts) ? parsed.weakConcepts : ["definitions", "code examples"],
      quizScores: Array.isArray(parsed.quizScores) ? parsed.quizScores : []
    };
  } catch {
    return { completedTopics: [], weakConcepts: ["definitions", "code examples"], quizScores: [] };
  }
}

function writeMemory(topic: string, chapterTitle: string, summary?: RevisionSummary) {
  if (!summary) return;
  const memory = readMemory();
  const completedTopics = [...new Set([...(memory.completedTopics || []), topic, chapterTitle])].slice(-20);
  const weakConcepts = [...new Set([...(memory.weakConcepts || []), ...(summary.weakTopicPlan || []).slice(0, 2)])].slice(-10);
  window.localStorage.setItem(
    "codeverse-learning-memory",
    JSON.stringify({ ...memory, completedTopics, weakConcepts, lastStudiedAt: new Date().toISOString() })
  );
}
