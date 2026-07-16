"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ChatPanel } from "./chat-panel";
import { getAgent } from "@/lib/ai-classroom/agents";

type Props = {
  agentId: string;
};

export function AgentPage({ agentId }: Props) {
  const agent = getAgent(agentId);

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-5xl flex-col px-4 py-6">
      <Link
        href="/ai-classroom"
        className="mb-4 inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-brand-700"
      >
        <ArrowLeft className="size-4" /> Back to AI Classroom
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-ink dark:text-white">{agent.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{agent.persona}</p>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <ChatPanel
          agentId={agentId}
          placeholder={`Ask ${agent.name} anything about your learning...`}
        />
      </div>
    </div>
  );
}
