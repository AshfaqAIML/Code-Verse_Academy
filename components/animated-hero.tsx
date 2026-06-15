"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Database, Play, Sparkles, BadgeCheck, Flame, Trophy, Users } from "lucide-react";
import { getHomeStats } from "@/lib/stats";
import type { HomeStats } from "@/lib/stats";

const iconMap: Record<string, typeof Users> = {
  BadgeCheck, Flame, Code2, Trophy, Users,
};

const defaultStats: HomeStats[] = [
  { label: "Active learners", value: "128K", iconName: "Users" },
  { label: "Lessons completed", value: "3.4M", iconName: "BadgeCheck" },
  { label: "Daily code runs", value: "92K", iconName: "Code2" },
  { label: "Career wins", value: "18K", iconName: "Trophy" },
];

const codeLines = [
  "const path = createLearningPath('React');",
  "await runLab({ dataset: 'sales.csv' });",
  "model.train({ epochs: 12, accuracy: 0.94 });",
  "deploy.project('portfolio-cms');"
];

export function AnimatedHero() {
  const [heroStats, setHeroStats] = useState<HomeStats[]>(defaultStats);

  useEffect(() => {
    setHeroStats(getHomeStats());
  }, []);

  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:py-16">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.24),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(249,115,98,0.18),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(236,254,255,0.76))] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.16),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(249,115,98,0.12),transparent_25%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.88))]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-4 py-2 text-sm font-bold text-cyan-900 backdrop-blur dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-100">
            <Sparkles className="size-4" />
            Launch-ready learning paths for builders
          </div>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-ink dark:text-white sm:text-6xl lg:text-7xl">
            Learn Web Development & Data Science the Smart Way
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
            Interactive tutorials, VS Code-like playgrounds, analytics dashboards, AI labs, interview prep and
            real projects in one focused learning workspace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-black text-white shadow-glow transition hover:-translate-y-1 dark:bg-white dark:text-ink"
            >
              Start learning <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/playground"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/75 px-6 py-3.5 text-sm font-black text-ink backdrop-blur transition hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            >
              <Play className="size-4" /> Try playground
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {heroStats.map((stat) => {
              const Icon = iconMap[stat.iconName] || Trophy;
              return (
                <div key={stat.label} className="border-l border-slate-300/80 pl-4 dark:border-slate-700">
                  <Icon className="mb-2 size-5 text-brand-600" />
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="relative"
        >
          <div className="glass overflow-hidden rounded-[28px]">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800">
              <div className="flex gap-2">
                <span className="size-3 rounded-full bg-coral" />
                <span className="size-3 rounded-full bg-amber-400" />
                <span className="size-3 rounded-full bg-leaf" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">smart-lab.ts</span>
            </div>
            <div className="grid lg:grid-cols-[1fr_0.82fr]">
              <div className="bg-slate-950 p-5 font-mono text-sm leading-7 text-slate-200">
                <p className="text-slate-500">{"// Interactive lesson runtime"}</p>
                {codeLines.map((line, index) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.24 }}
                    className={index === codeLines.length - 1 ? "code-caret text-cyan-200" : "text-slate-100"}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
              <div className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Code2 className="size-5 text-brand-600" />
                  <span className="text-sm font-black">Live output</span>
                </div>
                <div className="space-y-3">
                  {["HTML", "CSS", "JavaScript", "Python", "SQL"].map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ width: 0 }}
                      animate={{ width: `${96 - index * 9}%` }}
                      transition={{ duration: 0.8, delay: 0.75 + index * 0.1 }}
                      className="rounded-full bg-slate-100 p-1 dark:bg-slate-800"
                    >
                      <div className="rounded-full bg-gradient-to-r from-brand-500 to-leaf px-3 py-1 text-xs font-black text-white">
                        {skill}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-3 flex items-center gap-2">
                    <Database className="size-4 text-leaf" />
                    <p className="text-sm font-black">Dataset insight</p>
                  </div>
                  <p className="text-3xl font-black">94%</p>
                  <p className="text-sm text-slate-500">model accuracy after guided tuning</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
