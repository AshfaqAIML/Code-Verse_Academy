"use client";

import { useState } from "react";
import { Sparkles, GraduationCap, Loader2, AlertCircle, Lightbulb, BookOpen } from "lucide-react";
import { LessonView } from "@/components/ai-classroom/lesson-view";
import type { LessonPlan } from "@/lib/ai-classroom/lesson-generator";

const suggestions = [
  "Introduction to Machine Learning",
  "React Hooks Explained",
  "Data Structures: Binary Trees",
  "Calculus: Derivatives & Integrals",
  "Python Async Programming",
  "Neural Networks from Scratch",
];

export default function LearnPage() {
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setLesson(null);

    try {
      const res = await fetch("/api/ai-classroom/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setLesson(data.lesson);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate lesson");
    } finally {
      setLoading(false);
    }
  }

  if (lesson) {
    return <LessonView lesson={lesson} onBack={() => { setLesson(null); setError(""); }} />;
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600">
            <GraduationCap className="size-8 text-white" />
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-ink dark:text-white">
            AI Classroom
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            Enter any topic and get an interactive AI-powered lesson with slides, quizzes, and group discussion.
          </p>
        </div>

        <div className="mt-10">
          <div className="relative">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Enter a topic to learn..."
              disabled={loading}
              className="w-full rounded-2xl border-2 border-slate-200 bg-white/80 px-6 py-4 pr-36 text-lg outline-none backdrop-blur transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900/80 dark:focus:border-brand-400"
            />
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-ink px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1/2 disabled:opacity-50 dark:bg-white dark:text-ink"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2"><Sparkles className="size-4" /> Generate</span>
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setTopic(s); }}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-brand-500 hover:text-brand-700 dark:border-slate-700 dark:hover:border-brand-600"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex items-center justify-center gap-2">
              <Loader2 className="size-6 animate-spin text-brand-600" />
              <span className="text-lg font-black">Generating your lesson...</span>
            </div>
            <div className="mt-6 flex items-center justify-center gap-8 text-sm text-slate-500">
              <span className="flex items-center gap-2"><BookOpen className="size-4" /> Creating slides</span>
              <span className="flex items-center gap-2"><Lightbulb className="size-4" /> Writing content</span>
              <span className="flex items-center gap-2"><Sparkles className="size-4" /> Preparing quiz</span>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-brand-500 to-purple-500" />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
            <div>
              <p className="font-bold text-red-800 dark:text-red-200">Generation failed</p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              {error.includes("API key") && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Set OPENAI_API_KEY in your environment to use the AI Classroom.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
