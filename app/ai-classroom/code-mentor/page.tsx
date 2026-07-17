"use client";

import { useState, useRef, useEffect } from "react";
import { Code2, Send, Loader2, Bug, Sparkles, BookOpen, ChevronRight, Trash2, History, Copy, Check } from "lucide-react";
import { useChatHistory } from "@/lib/ai-classroom/use-chat-history";

type Mode = "review" | "debug" | "optimize" | "explain";
type ChatEntry = { role: "user" | "assistant"; content: string };

const MODES: { id: Mode; label: string; icon: typeof Bug; prompt: string }[] = [
  { id: "review", label: "Code Review", icon: Code2, prompt: "Review this code. Check for bugs, style issues, and best practices. Be constructive and specific." },
  { id: "debug", label: "Debug", icon: Bug, prompt: "Debug this code. Identify what's wrong, explain why, and show the fix." },
  { id: "optimize", label: "Optimize", icon: Sparkles, prompt: "Optimize this code for performance, readability, and maintainability. Suggest specific improvements." },
  { id: "explain", label: "Explain", icon: BookOpen, prompt: "Explain this code in simple terms. Break down what each part does and how they work together." },
];

export default function CodeMentorPage() {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<Mode>("review");
  const [language, setLanguage] = useState("javascript");
  const { messages, setMessages, clearMessages } = useChatHistory<ChatEntry>("cv-code-mentor");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const codeHistory = useRef<Set<string>>(new Set());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  async function analyzeCode() {
    if (!code.trim() || streaming) return;
    const modeConfig = MODES.find((m) => m.id === mode)!;
    const userMsg = `[${modeConfig.label}]\nLanguage: ${language}\n\n\`\`\`${language}\n${code}\n\`\`\``;
    codeHistory.current.add(code.trim());
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setStreaming(true);
    setStreamText("");

    try {
      const res = await fetch("/api/ai-classroom/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "assistant",
          message: `${modeConfig.prompt}\n\n${userMsg}`,
          history: [],
          topic: "Code Mentor",
        }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const content = parsed.type === "text_delta" ? parsed.data?.content : parsed.content;
            if (content) { full += content; setStreamText(full); }
          } catch {}
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      setStreamText("");
    } catch (e) {
      console.error(e);
    } finally {
      setStreaming(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || streaming) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setStreaming(true);
    setStreamText("");

    try {
      const res = await fetch("/api/ai-classroom/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "assistant",
          message: input,
          history: messages.slice(-10).map((m) => ({ id: "", agentId: m.role === "user" ? "user" : "assistant", role: "assistant", agentName: m.role === "user" ? "You" : "AI Assistant", content: m.content, timestamp: Date.now() })),
          topic: "Code Mentor",
        }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const content = parsed.type === "text_delta" ? parsed.data?.content : parsed.content;
            if (content) { full += content; setStreamText(full); }
          } catch {}
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      setStreamText("");
    } catch (e) {
      console.error(e);
    } finally {
      setStreaming(false);
    }
  }

  function copyCode(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const lineCount = code ? code.split("\n").length : 0;

  return (
    <main className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 p-3">
            <Code2 className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Code Mentor</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Get AI-powered code reviews, debugging, optimization, and explanations</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="flex-1 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                        isActive
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="size-4" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold outline-none dark:border-slate-700 dark:bg-slate-800"
                  >
                    {["javascript", "typescript", "python", "java", "cpp", "go", "rust", "html", "css", "sql"].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  {code && (
                    <button onClick={() => copyCode(code)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                  <span className="text-xs text-slate-400">{lineCount} lines</span>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="h-72 w-full bg-transparent px-4 py-3 font-mono text-sm outline-none"
                spellCheck={false}
              />
            </div>

            <button
              onClick={analyzeCode}
              disabled={!code.trim() || streaming}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
            >
              {streaming ? <Loader2 className="size-4 animate-spin" /> : <ChevronRight className="size-4" />}
              {streaming ? "Analyzing..." : `Run ${MODES.find((m) => m.id === mode)?.label}`}
            </button>
          </div>

          <div className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:w-[480px]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h3 className="font-black">AI Mentor Chat</h3>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button onClick={clearMessages} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700">
                    <Trash2 className="size-3" /> Clear
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.length === 0 && !streaming && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Code2 className="size-12 text-blue-500/40" />
                  <p className="mt-4 text-lg font-black">Ask anything about code</p>
                  <p className="mt-2 text-sm text-slate-400">Or paste code and choose a mode above.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`group max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                    m.role === "user" ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-slate-50 dark:bg-slate-950"
                  }`}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.role === "assistant" && (
                      <button
                        onClick={() => copyCode(m.content)}
                        className="mt-2 flex items-center gap-1 text-xs text-slate-400 opacity-0 transition group-hover:opacity-100"
                      >
                        <Copy className="size-3" /> Copy response
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {streaming && streamText && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                    <p className="whitespace-pre-wrap text-sm leading-7">{streamText}</p>
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
                  placeholder="Ask a follow-up question..."
                  disabled={streaming}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || streaming}
                  className="rounded-xl bg-ink px-4 py-3 text-white disabled:opacity-50 dark:bg-white dark:text-ink"
                >
                  <Send className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
