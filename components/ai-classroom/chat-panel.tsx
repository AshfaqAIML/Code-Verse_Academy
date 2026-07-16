"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, GraduationCap, BrainCircuit, Users } from "lucide-react";
import type { ChatMessage, ChatRequest } from "@/lib/ai-classroom/types";
import { getAgent } from "@/lib/ai-classroom/agents";

const iconMap: Record<string, typeof Bot> = { Bot, GraduationCap, BrainCircuit, Users };

type Props = {
  agentId: string;
  topic?: string;
  chapterContent?: string;
  placeholder?: string;
};

export function ChatPanel({ agentId, topic, chapterContent, placeholder }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const agent = getAgent(agentId);
  const Icon = iconMap[agent.icon] ?? Bot;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStream]);

  async function handleSend() {
    if (!input.trim() || streaming) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      agentId: "user",
      role: "teacher",
      agentName: "You",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setCurrentStream("");

    try {
      const res = await fetch("/api/ai-classroom/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          message: userMsg.content,
          history: messages,
          topic,
          chapterContent,
        } satisfies ChatRequest),
      });

      if (!res.ok) throw new Error("Chat request failed");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

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
            const parsed = JSON.parse(data);
            if (parsed.content) {
              setCurrentStream((prev) => prev + parsed.content);
            }
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch (error) {
      setCurrentStream(`Sorry, I encountered an error: ${error}`);
    } finally {
      setStreaming(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          agentId,
          role: agent.role,
          agentName: agent.name,
          content: currentStream,
          timestamp: Date.now(),
        },
      ]);
      setCurrentStream("");
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className={`rounded-t-2xl bg-gradient-to-r ${agent.color} px-5 py-4`}>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/20 p-2 backdrop-blur">
            <Icon className="size-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white">{agent.name}</h3>
            <p className="text-xs font-semibold text-white/80">{agent.role.charAt(0).toUpperCase() + agent.role.slice(1)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon className="size-12 text-brand-600" />
            <p className="mt-4 text-lg font-black">Ask me anything about {topic || "your topic"}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{placeholder || "I'll explain, guide, and help you understand."}</p>
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.agentId === "user";
          return (
            <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  isUser
                    ? "bg-ink text-white dark:bg-white dark:text-ink"
                    : "bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200"
                }`}
              >
                {!isUser && <p className="mb-1 text-xs font-bold text-brand-600">{msg.agentName}</p>}
                <p className="whitespace-pre-wrap text-sm leading-7">{msg.content}</p>
              </div>
            </div>
          );
        })}
        {streaming && currentStream && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
              <p className="mb-1 text-xs font-bold text-brand-600">{agent.name}</p>
              <p className="whitespace-pre-wrap text-sm leading-7">{currentStream}</p>
              <span className="inline-block size-2 animate-pulse rounded-full bg-brand-500" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={placeholder || `Ask ${agent.name}...`}
            disabled={streaming}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-brand-400"
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
  );
}
