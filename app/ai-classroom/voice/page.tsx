"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, Bot, Trash2, Languages } from "lucide-react";
import { useChatHistory } from "@/lib/ai-classroom/use-chat-history";

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string }; isFinal?: boolean }; length: number } }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

type Message = { role: "user" | "assistant"; content: string };

const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "zh-CN", label: "Chinese" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ar-SA", label: "Arabic" },
];

export default function VoiceLearningPage() {
  const { messages, setMessages, clearMessages } = useChatHistory<Message>("cv-voice");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [lang, setLang] = useState("en-US");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => setVoices(synthRef.current?.getVoices() ?? []);
      loadVoices();
      synthRef.current?.addEventListener("voiceschanged", loadVoices);
      return () => synthRef.current?.removeEventListener("voiceschanged", loadVoices);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: { results: { [index: number]: { [index: number]: { transcript: string }; isFinal?: boolean }; length: number } }) => {
      let final = "";
      for (let i = event.results.length - 1; i >= 0; i--) {
        if (event.results[i].isFinal) {
          final = event.results[i][0].transcript;
          break;
        }
      }
      setTranscript(final || event.results[event.results.length - 1][0].transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setTranscript("");
  }, [lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  function speak(text: string) {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const match = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (match) utterance.voice = match;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = lang;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    synthRef.current.speak(utterance);
  }

  function stopSpeaking() {
    synthRef.current?.cancel();
    setSpeaking(false);
  }

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput("");
    setTranscript("");
    setStreaming(true);
    setStreamText("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);

    try {
      const res = await fetch("/api/ai-classroom/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "teacher",
          message: msg,
          history: [],
          topic: "General",
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
            if (content) {
              full += content;
              setStreamText(full);
            }
          } catch {}
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      setStreamText("");
      speak(full);
    } catch (e) {
      console.error(e);
    } finally {
      setStreaming(false);
    }
  }

  const currentText = streamText || messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content || "";

  return (
    <main className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 p-3">
              <Mic className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Voice Learning</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Speak your questions, listen to AI responses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="size-4 text-slate-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none dark:border-slate-700 dark:bg-slate-900"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={listening ? stopListening : startListening}
            className={`flex items-center gap-3 rounded-2xl px-8 py-4 text-lg font-bold text-white transition ${
              listening
                ? "bg-red-500 shadow-lg shadow-red-200 animate-pulse"
                : "bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
            }`}
          >
            {listening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
            {listening ? "Listening..." : "Click to Speak"}
          </button>
          {currentText && (
            <button
              onClick={speaking ? stopSpeaking : () => speak(currentText)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${
                speaking
                  ? "bg-emerald-500 text-white"
                  : "border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              {speaking ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              {speaking ? "Stop" : "Read Aloud"}
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-red-500 transition hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-900/20"
            >
              <Trash2 className="size-5" /> Clear
            </button>
          )}
        </div>

        {transcript && !streaming && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <p className="text-xs font-bold text-slate-400">Recognized:</p>
            {transcript}
          </div>
        )}

        <div ref={chatRef} className="mb-4 max-h-[50vh] space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          {messages.length === 0 && !streaming && (
            <p className="py-8 text-center text-sm text-slate-400">
              Click the mic button and speak, or type below.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  m.role === "user"
                    ? "bg-ink text-white dark:bg-white dark:text-ink"
                    : "bg-slate-50 dark:bg-slate-950"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-7">{m.content}</p>
              </div>
            </div>
          ))}
          {streaming && streamText && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                <p className="whitespace-pre-wrap text-sm leading-7">{streamText}</p>
                <span className="inline-block size-2 animate-pulse rounded-full bg-brand-500" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={listening ? "Listening..." : "Or type your question..."}
            disabled={streaming}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || streaming}
            className="rounded-xl bg-ink px-4 py-3 text-white disabled:opacity-50 dark:bg-white dark:text-ink"
          >
            {streaming ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          </button>
        </div>
      </div>
    </main>
  );
}
