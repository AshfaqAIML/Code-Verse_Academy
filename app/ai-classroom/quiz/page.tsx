"use client";

import { useState, useEffect, useCallback } from "react";
import { Section } from "@/components/section";
import { ListChecks, Loader2, CheckCircle, XCircle, RotateCcw, Timer, SkipForward, BarChart3, AlertCircle } from "lucide-react";
import type { QuizContent, QuizQuestion } from "@/lib/ai-classroom/generation/types";

type Difficulty = "all" | "easy" | "medium" | "hard";

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "all", label: "Any" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

const QUESTION_COUNTS = [3, 5, 10];

export default function SmartQuizPage() {
  const [chapterContent, setChapterContent] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState<QuizContent | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0 && timerActive) {
      setTimerActive(false);
      submitQuiz();
    }
  }, [timeLeft, timerActive]);

  async function generateQuiz() {
    if (!chapterContent.trim()) return;
    setLoading(true);
    setError("");
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setSkipped(new Set());

    try {
      const res = await fetch("/api/ai-classroom/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quiz",
          chapterContent: chapterContent.slice(0, 5000),
          chapterTitle: chapterTitle || "Lesson",
          count: questionCount,
          difficulty: difficulty === "all" ? undefined : difficulty,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuiz(data.data);
        setTimeLeft(data.data.questions.length * 30);
        setTimerActive(true);
      } else {
        setError("Failed to generate quiz. Try different content.");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function toggleAnswer(questionId: string, value: string) {
    if (submitted) return;
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(value)) {
        return { ...prev, [questionId]: current.filter((v) => v !== value) };
      }
      return { ...prev, [questionId]: [...current, value] };
    });
    setSkipped((prev) => { const n = new Set(prev); n.delete(questionId); return n; });
  }

  function skipQuestion(id: string) {
    setSkipped((prev) => new Set(prev).add(id));
  }

  function submitQuiz() {
    setSubmitted(true);
    setTimerActive(false);
  }

  function isCorrect(q: QuizQuestion): boolean {
    const userAns = answers[q.id] || [];
    return JSON.stringify([...userAns].sort()) === JSON.stringify([...q.correctAnswer].sort());
  }

  const totalTime = quiz ? quiz.questions.length * 30 : 0;
  const answered = quiz ? quiz.questions.filter((q) => (answers[q.id]?.length || 0) > 0).length : 0;

  return (
    <main className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-3">
            <ListChecks className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Smart Quiz</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Generate quizzes from any lesson content</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="size-5 shrink-0" />
            {error}
          </div>
        )}

        {!quiz && (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <input
              type="text"
              placeholder="Chapter title (optional)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
            />
            <textarea
              placeholder="Paste your lesson/chapter content here..."
              className="h-48 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              value={chapterContent}
              onChange={(e) => setChapterContent(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Difficulty:</span>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      difficulty === d.id
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Questions:</span>
                {QUESTION_COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      questionCount === n
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={generateQuiz}
              disabled={loading || !chapterContent.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ListChecks className="size-4" />}
              {loading ? "Generating..." : "Generate Quiz"}
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-brand-600" />
          </div>
        )}

        {quiz && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-black">{quiz.title}</h2>
              <div className="flex items-center gap-3">
                {timerActive && (
                  <span className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold ${
                    timeLeft <= 10 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700 dark:bg-slate-800"
                  }`}>
                    <Timer className="size-4" />
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                )}
                <button
                  onClick={() => { setQuiz(null); setSubmitted(false); setError(""); }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="size-4" /> New Quiz
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{answered}/{quiz.questions.length} answered</span>
                <span>{Math.round((answered / quiz.questions.length) * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                  style={{ width: `${(answered / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((q, i) => {
                const isSkipped = skipped.has(q.id);
                const hasAnswer = (answers[q.id]?.length || 0) > 0;
                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-5 transition ${
                      submitted
                        ? isCorrect(q)
                          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20"
                          : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                        : isSkipped
                          ? "border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-900/10"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <p className="font-bold">
                        <span className="text-slate-400">Q{i + 1}.</span> {q.question}
                      </p>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                            q.difficulty === "easy"
                              ? "bg-emerald-100 text-emerald-700"
                              : q.difficulty === "hard"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        {!submitted && !hasAnswer && (
                          <button
                            onClick={() => skipQuestion(q.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Skip"
                          >
                            <SkipForward className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const selected = answers[q.id]?.includes(opt.value) || false;
                        const isCorrectOpt = q.correctAnswer.includes(opt.value);
                        const showCorrect = submitted && isCorrectOpt;
                        const showWrong = submitted && selected && !isCorrectOpt;

                        return (
                          <button
                            key={opt.value}
                            onClick={() => toggleAnswer(q.id, opt.value)}
                            disabled={submitted}
                            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                              showCorrect
                                ? "border-emerald-400 bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30"
                                : showWrong
                                  ? "border-red-400 bg-red-100 text-red-800 dark:bg-red-800/30"
                                  : selected
                                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                            }`}
                          >
                            {showCorrect && <CheckCircle className="size-4 shrink-0 text-emerald-600" />}
                            {showWrong && <XCircle className="size-4 shrink-0 text-red-600" />}
                            {!submitted && selected && !showCorrect && (
                              <div className="size-4 shrink-0 rounded-full border-2 border-brand-500" />
                            )}
                            {!submitted && !selected && (
                              <div className="size-4 shrink-0 rounded-full border-2 border-slate-300" />
                            )}
                            <span className="font-medium">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {isCorrect(q) ? "✅ " : "❌ "}
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!submitted && (
              <button
                onClick={submitQuiz}
                className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:from-brand-600 hover:to-purple-700"
              >
                Submit Answers ({answered}/{quiz.questions.length} answered)
              </button>
            )}

            {submitted && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-center gap-8 text-center">
                    <div>
                      <p className="text-3xl font-black text-emerald-600">
                        {quiz.questions.filter((q) => isCorrect(q)).length}
                      </p>
                      <p className="text-xs text-slate-500">Correct</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-red-500">
                        {quiz.questions.filter((q) => !isCorrect(q)).length}
                      </p>
                      <p className="text-xs text-slate-500">Incorrect</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-brand-600">
                        {Math.round((quiz.questions.filter((q) => isCorrect(q)).length / quiz.questions.length) * 100)}%
                      </p>
                      <p className="text-xs text-slate-500">Score</p>
                    </div>
                    <div>
                      <p className="flex items-center justify-center gap-1 text-3xl font-black text-slate-600">
                        <BarChart3 className="size-6" />
                        {answered}
                      </p>
                      <p className="text-xs text-slate-500">Answered</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setQuiz(null); setSubmitted(false); setError(""); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="size-4" /> Try Another Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
