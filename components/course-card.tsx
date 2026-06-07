"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, PlayCircle, BookOpenText } from "lucide-react";
import { recordRecentLearning } from "@/lib/learning-memory";

type Course = {
  title: string;
  slug: string;
  bookSlug?: string;
  category: string;
  level: string;
  lessons: number;
  progress: number;
  color: string;
  description: string;
  chapters: string[];
  certificate: boolean;
};

export function CourseCard({ course }: { course: Course }) {
  const readHref = course.bookSlug ? `/tutorials/${course.bookSlug}` : `/tutorial/${course.slug}`;

  const watchHref = useMemo(() => `/courses/${course.slug}/watch`, [course.slug]);
  const practiceHref = useMemo(() => `/tutorial/${course.slug}`, [course.slug]);

  const rememberOpen = () => {
    const target = readHref;
    recordRecentLearning({
      title: course.title,
      href: target,
      kind: course.bookSlug ? "book" : "course"
    });
  };

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
    >
      <div className={`h-2 bg-gradient-to-r ${course.color}`} />
      <div className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">{course.category}</p>
            <h3 className="mt-2 text-xl font-black tracking-tight">{course.title}</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {course.level}
          </span>
        </div>
        <p className="min-h-[72px] text-sm leading-6 text-slate-600 dark:text-slate-300">{course.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {course.chapters.map((chapter) => (
            <span
              key={chapter}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400"
            >
              {chapter}
            </span>
          ))}
        </div>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
            <span>{course.lessons} lessons</span>
            <span>{course.progress}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-2 rounded-full bg-gradient-to-r ${course.color}`} style={{ width: `${course.progress}%` }} />
          </div>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <Link
            href={readHref}
            onClick={rememberOpen}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-3 py-3 text-xs font-black text-white transition hover:-translate-y-0.5 sm:text-sm dark:bg-white dark:text-ink"
          >
            <BookOpenText className="size-4 shrink-0" />
            <span className="whitespace-nowrap">Read</span>
          </Link>
          <Link
            href={watchHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-cyan-300 sm:text-sm"
          >
            <PlayCircle className="size-4 shrink-0" />
            <span className="whitespace-nowrap">Watch</span>
          </Link>
          <Link
            href={practiceHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-black text-slate-700 transition hover:border-brand-500 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:text-cyan-300 sm:text-sm"
          >
            <CheckCircle2 className="size-4 shrink-0 text-leaf" />
            <span className="whitespace-nowrap">Practice</span>
          </Link>
          <div className="pt-2 text-xs font-bold text-slate-500 dark:text-slate-400 sm:col-span-3">
            {course.certificate ? "Certificate available" : "Certificate not available yet"}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
