"use client";

import { useState, useCallback, useMemo } from "react";
import { ArrowLeft, Bot, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { CourseSidebar } from "./course-sidebar";
import { ChapterViewer } from "./chapter-viewer";
import { ChatPanel } from "./chat-panel";
import type { AICourse } from "@/lib/ai-classroom/courses";

type Props = {
  course: AICourse;
};

export function ClassroomShell({ course }: Props) {
  const [activeSlug, setActiveSlug] = useState(course.book?.chapters[0]?.slug ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);

  const chapters = useMemo(
    () =>
      (course.book?.chapters ?? []).map((ch) => ({
        number: ch.number,
        slug: ch.slug,
        title: ch.title,
      })),
    [course.book]
  );

  const handleNavigate = useCallback((slug: string) => {
    setActiveSlug(slug);
  }, []);

  const activeChapter = useMemo(
    () => course.book?.chapters.find((ch) => ch.slug === activeSlug),
    [course.book, activeSlug]
  );

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center gap-3">
          <Link
            href="/ai-classroom"
            className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-brand-700"
          >
            <ArrowLeft className="size-4" /> AI Classroom
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-sm font-black text-ink dark:text-white">{course.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
          </button>
          <button
            onClick={() => setChatOpen((p) => !p)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            title={chatOpen ? "Close AI panel" : "Open AI panel"}
          >
            <Bot className="size-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <CourseSidebar
              chapters={chapters}
              activeSlug={activeSlug}
              onSelect={handleNavigate}
            />
          </aside>
        )}

        <main className="flex-1 overflow-hidden px-6 py-8">
          {course.book ? (
            <ChapterViewer
              bookSlug={course.book.slug}
              chapterSlug={activeSlug}
              onNavigate={handleNavigate}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-slate-500">Course content not available</p>
            </div>
          )}
        </main>

        {chatOpen && (
          <aside className="w-96 shrink-0 border-l border-slate-200 dark:border-slate-800">
            <ChatPanel
              agentId="teacher"
              topic={activeChapter?.title}
              chapterContent={activeChapter?.blocks.map((b) => b.text).join("\n").slice(0, 12000)}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
