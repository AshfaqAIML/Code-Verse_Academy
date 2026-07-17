"use client";

import { ArrowLeft, Bot, GraduationCap, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { ChatPanel } from "./chat-panel";
import { getAgent } from "@/lib/ai-classroom/agents";

const iconMap: Record<string, typeof Bot> = { Bot, GraduationCap, BrainCircuit };

type Props = {
  agentId: string;
};

export function AgentPage({ agentId }: Props) {
  const agent = getAgent(agentId);
  const Icon = iconMap[agent.icon] ?? Bot;

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto flex h-[calc(100vh-80px)] max-w-5xl flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl bg-gradient-to-r ${agent.color} p-3`}>
              <Icon className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">{agent.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{agent.persona}</p>
            </div>
          </div>
          <Link
            href="/ai-classroom"
            className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-brand-700"
          >
            <ArrowLeft className="size-4" /> Back
          </Link>
        </div>

        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <ChatPanel
            agentId={agentId}
            placeholder={`Ask ${agent.name} anything about your learning...`}
          />
        </div>
      </div>
    </main>
  );
}
