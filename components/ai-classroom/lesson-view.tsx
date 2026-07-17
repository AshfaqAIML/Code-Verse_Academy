"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, GraduationCap, ListChecks, MessageSquareMore,
  BookOpen, CheckCircle2, XCircle, AlertCircle, Loader2, Send,
} from "lucide-react";
import type { LessonPlan, LessonScene } from "@/lib/ai-classroom/lesson-generator";
import type { QuizQuestion } from "@/lib/ai-classroom/generation/types";
import { getAgentsByRole } from "@/lib/ai-classroom/agents";
import type { ChatMessage, SSEEvent } from "@/lib/ai-classroom/types";

function MarkdownContent({ content }: { content: string }) {
  const html = useMemo(() => {
    let h = content
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>[\s\S]*?<\/li>)/g, (m) => `<ul>${m}</ul>`)
      .replace(/```(\w*)\n?([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/^([^<].+)$/gm, (m) => {
        if (m.startsWith("<")) return m;
        return `<p>${m}</p>`;
      });
    h = h.replace(/(<\/ul>\s*<ul>)/g, "");
    return h;
  }, [content]);

  return (
    <div
      className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-black prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm dark:prose-code:bg-slate-800 prose-pre:rounded-2xl prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700 prose-li:marker:text-brand-500"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function QuizScene({ questions, onComplete }: { questions: QuizQuestion[]; onComplete: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qId: string, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: [value] }));
  };

  const handleSubmit = () => {
    let correct = 0;
    for (const q of questions) {
      const userAns = answers[q.id] || [];
      if (JSON.stringify(userAns.sort()) === JSON.stringify([...q.correctAnswer].sort())) {
        correct++;
      }
    }
    setScore(correct);
    setSubmitted(true);
    onComplete(correct, questions.length);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          Answer the questions below. Click submit when done.
        </p>
      </div>
      {questions.map((q, qi) => {
        const userAns = answers[q.id] || [];
        const isCorrect = submitted && JSON.stringify(userAns.sort()) === JSON.stringify([...q.correctAnswer].sort());
        const isWrong = submitted && !isCorrect;
        return (
          <div key={q.id} className={`rounded-2xl border p-5 transition ${
            isCorrect ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20" :
            isWrong ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20" :
            "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          }`}>
            <div className="mb-3 flex items-start justify-between">
              <p className="font-black">Q{qi + 1}. {q.question}</p>
              <span className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                q.difficulty === "easy" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" :
                q.difficulty === "hard" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              }`}>{q.difficulty}</span>
            </div>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const selected = userAns.includes(opt.value);
                const isCorrectOpt = submitted && q.correctAnswer.includes(opt.value);
                const isWrongOpt = submitted && selected && !q.correctAnswer.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(q.id, opt.value)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      isCorrectOpt ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200" :
                      isWrongOpt ? "border-red-400 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-950/40 dark:text-red-200" :
                      selected ? "border-brand-500 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/30" :
                      "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                    }`}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold dark:bg-slate-800">
                      {opt.value}
                    </span>
                    <span>{opt.label}</span>
                    {isCorrectOpt && <CheckCircle2 className="ml-auto size-4 shrink-0 text-emerald-500" />}
                    {isWrongOpt && <XCircle className="ml-auto size-4 shrink-0 text-red-500" />}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className={`mt-4 rounded-xl p-4 text-sm ${
                isCorrect ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" :
                "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
              }`}>
                <p className="font-bold">{isCorrect ? "Correct!" : "Incorrect"}</p>
                <p className="mt-1">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-ink"
        >
          <CheckCircle2 className="size-4" /> Submit Answers
        </button>
      )}
      {submitted && (
        <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 p-6 text-center text-white">
          <p className="text-3xl font-black">{score}/{questions.length}</p>
          <p className="mt-1 text-sm opacity-90">
            {score === questions.length ? "Perfect score!" :
             score >= questions.length / 2 ? "Good job!" :
             "Keep practicing!"}
          </p>
        </div>
      )}
    </div>
  );
}

type Props = {
  lesson: LessonPlan;
  onBack: () => void;
};

export function LessonView({ lesson, onBack }: Props) {
  const [currentScene, setCurrentScene] = useState(0);
  const scene = lesson.scenes[currentScene];
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [discussionInput, setDiscussionInput] = useState("");
  const [discussionStreaming, setDiscussionStreaming] = useState(false);
  const [discussionMessages, setDiscussionMessages] = useState<ChatMessage[]>([]);
  const [agentStreams, setAgentStreams] = useState<{ agentId: string; agentName: string; content: string; active: boolean }[]>([]);

  const classmates = getAgentsByRole("classmate");

  const progress = ((currentScene + 1) / lesson.scenes.length) * 100;

  const handleNext = () => {
    if (currentScene < lesson.scenes.length - 1) {
      setCurrentScene((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (currentScene > 0) {
      setCurrentScene((p) => p - 1);
    }
  };

  async function handleDiscussion() {
    if (!discussionInput.trim() || discussionStreaming) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      agentId: "user",
      role: "classmate",
      agentName: "You",
      content: discussionInput.trim(),
      timestamp: Date.now(),
    };
    setDiscussionMessages((prev) => [...prev, userMsg]);
    setDiscussionInput("");
    setDiscussionStreaming(true);
    setAgentStreams([]);

    try {
      const res = await fetch("/api/ai-classroom/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentIds: classmates.map((c) => c.id),
          message: userMsg.content,
          history: discussionMessages,
          topic: lesson.topic,
          chapterContent: scene.content.slice(0, 3000),
        }),
      });

      if (!res.ok) throw new Error("Discussion request failed");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let currentAgentId = "";
      const agentMessages: ChatMessage[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const event: SSEEvent = JSON.parse(data);
            switch (event.type) {
              case "agent_start":
                currentAgentId = event.data.agentId;
                setAgentStreams((prev) => [
                  ...prev.filter((s) => s.agentId !== event.data.agentId),
                  { agentId: event.data.agentId, agentName: event.data.agentName, content: "", active: true },
                ]);
                break;
              case "text_delta":
                setAgentStreams((prev) =>
                  prev.map((s) =>
                    s.agentId === currentAgentId ? { ...s, content: s.content + event.data.content } : s
                  )
                );
                break;
              case "agent_end":
                setAgentStreams((prev) => {
                  const agent = prev.find((s) => s.agentId === event.data.agentId);
                  if (agent) {
                    agentMessages.push({
                      id: event.data.messageId,
                      agentId: event.data.agentId,
                      role: "classmate",
                      agentName: agent.agentName,
                      content: agent.content,
                      timestamp: Date.now(),
                    });
                  }
                  return prev.filter((s) => s.agentId !== event.data.agentId);
                });
                break;
              case "error":
                console.error("SSE error:", event.data.message);
                break;
            }
          } catch { /* skip */ }
        }
      }
      setDiscussionMessages((prev) => [...prev, ...agentMessages]);
    } catch (error) {
      console.error("Discussion error:", error);
    } finally {
      setDiscussionStreaming(false);
      setAgentStreams([]);
    }
  }

  const typeIcons = { slide: BookOpen, quiz: ListChecks, discussion: MessageSquareMore };
  const typeColors: Record<string, string> = {
    slide: "from-cyan-400 to-blue-500",
    quiz: "from-emerald-400 to-teal-500",
    discussion: "from-rose-400 to-orange-500",
  };

  const sceneTypeLabels: Record<string, string> = {
    slide: "Lesson",
    quiz: "Quiz",
    discussion: "Discussion",
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-5xl flex-col px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-brand-700 transition-colors">
            <ChevronLeft className="size-4" /> Back
          </button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-sm font-black text-ink dark:text-white truncate max-w-md">{lesson.title}</span>
        </div>
        <span className="text-xs font-bold text-slate-400">
          Scene {currentScene + 1} of {lesson.scenes.length}
        </span>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        {lesson.scenes.map((s, i) => {
          const Icon = typeIcons[s.type];
          const isActive = i === currentScene;
          const isDone = i < currentScene;
          return (
            <button
              key={s.id}
              onClick={() => setCurrentScene(i)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                isActive
                  ? "bg-ink text-white dark:bg-white dark:text-ink shadow-md"
                  : isDone
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className={`rounded-xl bg-gradient-to-r ${typeColors[scene.type]} p-2.5`}>
            {React.createElement(typeIcons[scene.type], { className: "size-5 text-white" })}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{sceneTypeLabels[scene.type]}</p>
            <h2 className="text-2xl font-black">{scene.title}</h2>
          </div>
        </div>

        {scene.type === "slide" && (
          <MarkdownContent content={scene.content} />
        )}

        {scene.type === "quiz" && scene.quizQuestions && (
          <QuizScene
            questions={scene.quizQuestions}
            onComplete={(score, total) => setQuizScore({ score, total })}
          />
        )}

        {scene.type === "discussion" && (
          <div>
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 p-5 dark:from-rose-950/20 dark:to-orange-950/20">
              <p className="font-bold text-rose-800 dark:text-rose-200">Discussion Prompt</p>
              <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
                {scene.discussionPrompt || "Discuss this topic with your AI classmates."}
              </p>
            </div>

            <div className="space-y-4">
              {discussionMessages.map((msg) => {
                const isUser = msg.agentId === "user";
                const agent = classmates.find((c) => c.id === msg.agentId);
                const initials = agent?.name?.charAt(0) || "?";
                return (
                  <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      isUser
                        ? "bg-ink text-white dark:bg-white dark:text-ink"
                        : "bg-slate-50 dark:bg-slate-950"
                    }`}>
                      {!isUser && (
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">{initials}</div>
                          <p className="text-xs font-bold text-brand-600">{msg.agentName}</p>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-sm leading-7">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              {agentStreams.map((stream) => (
                <div key={stream.agentId} className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                        {stream.agentName?.charAt(0) || "?"}
                      </div>
                      <p className="text-xs font-bold text-brand-600">{stream.agentName}</p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7">{stream.content}</p>
                    <span className="mt-1 inline-block size-2 animate-pulse rounded-full bg-brand-500" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
              <input
                value={discussionInput}
                onChange={(e) => setDiscussionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDiscussion()}
                placeholder="Share your thoughts on this topic..."
                disabled={discussionStreaming}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950"
              />
              <button
                onClick={handleDiscussion}
                disabled={!discussionInput.trim() || discussionStreaming}
                className="rounded-xl bg-ink px-4 py-3 text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-ink"
              >
                {discussionStreaming ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentScene === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 disabled:opacity-30 dark:border-slate-700"
        >
          <ChevronLeft className="size-4" /> Previous
        </button>

        <div className="flex gap-1">
          {lesson.scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentScene(i)}
              className={`size-2.5 rounded-full transition ${
                i === currentScene
                  ? "bg-ink scale-125 dark:bg-white"
                  : i < currentScene
                    ? "bg-brand-500"
                    : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentScene === lesson.scenes.length - 1}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-30 dark:bg-white dark:text-ink"
        >
          Next <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
