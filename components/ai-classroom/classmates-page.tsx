"use client";

import { useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { ChatPanel } from "./chat-panel";
import { getAgentsByRole } from "@/lib/ai-classroom/agents";

const classmates = getAgentsByRole("classmate");

export function ClassmatesPage() {
  const [activeClassmate, setActiveClassmate] = useState(classmates[0]?.id ?? "");

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-6xl flex-col px-4 py-6">
      <Link
        href="/ai-classroom"
        className="mb-4 inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-brand-700"
      >
        <ArrowLeft className="size-4" /> Back to AI Classroom
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-ink dark:text-white">
          <Users className="size-8 text-brand-600" />
          AI Classmates
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Learn with AI peers at different skill levels. They ask questions, discuss concepts, and simulate a real classroom.
        </p>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-72 shrink-0 space-y-2 overflow-y-auto">
          {classmates.map((cm) => {
            const isActive = cm.id === activeClassmate;
            return (
              <button
                key={cm.id}
                onClick={() => setActiveClassmate(cm.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <p className="text-sm font-black">{cm.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 line-clamp-2">{cm.persona}</p>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <ChatPanel
            agentId={activeClassmate}
            placeholder={`Chat with ${classmates.find((c) => c.id === activeClassmate)?.name ?? "classmates"}...`}
          />
        </div>
      </div>
    </div>
  );
}
