"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { progressData, skillData } from "@/lib/data";

export type LearningPoint = { name: string; xp: number };
export type SkillPoint = { subject: string; score: number };

export function LearningChart({ data = progressData }: { data?: LearningPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="xp" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.25)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(148,163,184,.3)" }} />
          <Area type="monotone" dataKey="xp" stroke="#0891b2" strokeWidth={3} fill="url(#xp)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillChart({ data = skillData }: { data?: SkillPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.25)" vertical={false} />
          <XAxis dataKey="subject" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(148,163,184,.3)" }} />
          <Bar dataKey="score" fill="#2fbf71" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
