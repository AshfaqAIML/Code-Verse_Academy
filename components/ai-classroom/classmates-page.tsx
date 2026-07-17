"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Users, Send, Loader2, Bot, GraduationCap, BrainCircuit, Trash2, Clock } from "lucide-react";
import Link from "next/link";
import { useChatHistory } from "@/lib/ai-classroom/use-chat-history";
import { getAgentsByRole } from "@/lib/ai-classroom/agents";
import type { ChatMessage, SSEEvent } from "@/lib/ai-classroom/types";

const iconMap: Record<string, typeof Bot> = { Bot, GraduationCap, BrainCircuit, Users };
const classmates = getAgentsByRole("classmate");

const AGENT_COLORS: Record<string, string> = {
  "beginner-alex": "bg-emerald-500",
  "intermediate-jordan": "bg-blue-500",
  "advanced-sam": "bg-purple-500",
};

const AGENT_INITIALS: Record<string, string> = {
  "beginner-alex": "A",
  "intermediate-jordan": "J",
  "advanced-sam": "S",
};

type AgentStreamState = {
  agentId: string;
  agentName: string;
  content: string;
  active: boolean;
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingDots() {
  return (
    <span className="inline-flex gap-0.5">
      <span className="size-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:0ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:300ms]" />
    </span>
  );
}

export function ClassmatesPage() {
  const { messages, setMessages, clearMessages } = useChatHistory<ChatMessage>("cv-classmates");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [agentStreams, setAgentStreams] = useState<AgentStreamState[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentStreams]);

  async function handleSend() {
    if (!input.trim() || streaming) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      agentId: "user",
      role: "classmate",
      agentName: "You",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setAgentStreams([]);

    try {
      const res = await fetch("/api/ai-classroom/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentIds: classmates.map((c) => c.id),
          message: userMsg.content,
          history: messages,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");
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
                  {
                    agentId: event.data.agentId,
                    agentName: event.data.agentName,
                    content: "",
                    active: true,
                  },
                ]);
                break;
              case "text_delta":
                setAgentStreams((prev) =>
                  prev.map((s) =>
                    s.agentId === (event.data as Record<string, string>).messageId?.split("-")[1] || s.agentId === currentAgentId
                      ? { ...s, content: s.content + event.data.content }
                      : s,
                  ),
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
              case "cue_user":
                break;
              case "error":
                console.error("SSE error:", event.data.message);
                break;
            }
          } catch { /* skip malformed */ }
        }
      }

      setMessages((prev) => [...prev, ...agentMessages]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setStreaming(false);
      setAgentStreams([]);
    }
  }

  const allAgents = [...messages.map((m) => m.agentId), ...agentStreams.map((s) => s.agentId)];
  const uniqueAgents = [...new Set(allAgents)].filter((id) => id !== "user");

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-6xl flex-col px-4 py-6">
      <Link
        href="/ai-classroom"
        className="mb-4 inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-brand-700"
      >
        <ArrowLeft className="size-4" /> Back to AI Classroom
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-ink dark:text-white">
            <Users className="size-8 text-brand-600" />
            AI Classmates — Group Discussion
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Ask a question and all AI classmates will discuss together. Beginner Alex, Intermediate Jordan, and Advanced Sam each bring their perspective.
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearMessages} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-900/20">
            <Trash2 className="size-4" /> Clear Chat
          </button>
        )}
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="hidden w-64 shrink-0 space-y-2 overflow-y-auto sm:block">
          {classmates.map((cm) => {
            const hasSpoken = uniqueAgents.includes(cm.id);
            const agentStream = agentStreams.find((s) => s.agentId === cm.id);
            return (
              <div
                key={cm.id}
                className={`rounded-2xl border p-4 transition ${
                  agentStream
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                    : hasSpoken
                      ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-full text-sm font-bold text-white ${AGENT_COLORS[cm.id] || "bg-slate-500"}`}>
                    {AGENT_INITIALS[cm.id] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-black">{cm.name}</p>
                    <p className="text-xs text-slate-500">{cm.persona}</p>
                  </div>
                </div>
                {agentStream && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-brand-600">
                    <TypingDots />
                    <span>typing...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && !streaming && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="size-16 text-brand-600/40" />
                <p className="mt-4 text-xl font-black">Start a discussion</p>
                <p className="mt-2 text-sm text-slate-500">
                  Ask a question and the whole class will discuss it.
                </p>
              </div>
            )}
            {messages.map((msg) => {
              const isUser = msg.agentId === "user";
              const agent = classmates.find((c) => c.id === msg.agentId);
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      isUser
                        ? "bg-ink text-white dark:bg-white dark:text-ink"
                        : "bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200"
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-2 flex items-center gap-2">
                        <div className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${AGENT_COLORS[msg.agentId] || "bg-slate-500"}`}>
                          {AGENT_INITIALS[msg.agentId] || "?"}
                        </div>
                        <p className="text-xs font-bold">{msg.agentName}</p>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-7">{msg.content}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              );
            })}
            {agentStreams.map((stream) => {
              const agent = classmates.find((c) => c.id === stream.agentId);
              return (
                <div key={stream.agentId} className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                    <div className="mb-2 flex items-center gap-2">
                      <div className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${AGENT_COLORS[stream.agentId] || "bg-slate-500"}`}>
                        {AGENT_INITIALS[stream.agentId] || "?"}
                      </div>
                      <p className="text-xs font-bold">{stream.agentName}</p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7">{stream.content}</p>
                    {stream.content ? (
                      <span className="mt-1 inline-block size-2 animate-pulse rounded-full bg-brand-500" />
                    ) : (
                      <div className="mt-2 flex items-center gap-1 text-xs text-brand-600">
                        <TypingDots />
                        <span>thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask the class a question..."
                disabled={streaming}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                className="rounded-xl bg-ink px-4 py-3 text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-ink"
              >
                {streaming ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
