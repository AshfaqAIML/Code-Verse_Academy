"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LibraryBook, LibraryBookBlock, LibraryBookChapter, LibraryBookLesson } from "@/lib/books";
import { getBookProgress, recordBookProgress } from "@/lib/book-progress";
import { getBookmarks, recordRecentLearning, toggleBookmark } from "@/lib/learning-memory";

type ReaderBook = Pick<LibraryBook, "slug" | "title" | "category" | "description" | "parts" | "chapters">;

type Props = {
  book: ReaderBook;
  chapter: LibraryBookChapter;
  lesson?: LibraryBookLesson | null;
  previousLesson?: LibraryBookLesson | null;
  nextLesson?: LibraryBookLesson | null;
};

export function AIVolumeReader({ book, chapter, lesson, previousLesson, nextLesson }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [query, setQuery] = useState("");

  const currentBlocks = lesson?.blocks ?? chapter.blocks;
  const currentTitle = lesson?.title ?? chapter.title;
  const currentHref = lesson ? `/tutorials/${book.slug}/${chapter.slug}/${lesson.slug}` : `/tutorials/${book.slug}/${chapter.slug}`;
  const currentLabel = lesson ? `Lesson ${lesson.number}` : `Chapter ${chapter.number}`;
  const totalUnits = lesson ? Math.max(chapter.lessons?.length ?? 1, 1) : Math.max(book.chapters.length, 1);
  const currentUnit = lesson ? lesson.number : chapter.number;
  const readingTime = useMemo(() => lesson?.readingTime ?? chapter.readingTime ?? estimateReadingTime(currentBlocks), [chapter.readingTime, currentBlocks, lesson?.readingTime]);

  const filteredHeadings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const headings = currentBlocks
      .map((block, index) => ({ ...block, index }))
      .filter((block) => block.type === "heading" || block.type === "subheading");

    if (!normalized) return headings;
    return headings.filter((heading) => heading.text.toLowerCase().includes(normalized));
  }, [currentBlocks, query]);

  useEffect(() => {
    const saved = getBookProgress(book.slug);
    setProgressPercent(saved?.progress ?? Math.round((currentUnit / totalUnits) * 100));
    setBookmarked(getBookmarks().some((item) => item.href === currentHref));

    recordBookProgress({
      bookSlug: book.slug,
      chapterSlug: chapter.slug,
      chapterNumber: currentUnit,
      totalChapters: totalUnits
    });
  }, [book.slug, chapter.slug, currentHref, currentUnit, totalUnits]);

  const chapterList = book.chapters;

  const remember = () => {
    recordRecentLearning({
      title: `${book.title} - ${currentTitle}`,
      href: currentHref,
      kind: "book"
    });
  };

  const handleBookmark = () => {
    toggleBookmark({
      title: `${book.title} - ${currentTitle}`,
      href: currentHref,
      kind: "book"
    });
    setBookmarked((value) => !value);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <Link href={`/tutorials/${book.slug}`} className="inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-cyan-300">
            <ArrowLeft className="size-4" /> {book.title}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
              Navigation
            </button>
            <label className="hidden min-w-[320px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 md:flex">
              <Search className="size-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search headings in this lesson..."
                className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </label>
            <button
              type="button"
              onClick={() => setOutlineOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm font-black text-white transition dark:bg-white dark:text-ink"
            >
              <ListChecks className="size-4" />
              TOC
            </button>
          </div>
        </div>
      </div>

      <div className={`mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 ${sidebarOpen ? "xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)_280px]" : "xl:grid-cols-[minmax(0,1fr)_280px]"}`}>
        {sidebarOpen ? (
          <aside className="h-max rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="size-5 text-brand-600" />
                <h2 className="font-black">Volume map</h2>
              </div>
              <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close navigation">
                <PanelLeftClose className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              {book.parts?.length ? (
                book.parts.map((part) => (
                  <div key={part.slug} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Part {part.number}</p>
                    <p className="mt-1 font-black text-ink dark:text-white">{part.title}</p>
                    <div className="mt-3 space-y-1">
                      {part.chapters.map((chapterSlug) => {
                        const item = chapterList.find((entry) => entry.slug === chapterSlug);
                        if (!item) return null;
                        const isActive = item.slug === chapter.slug;
                        return (
                          <Link
                            key={item.slug}
                            href={`/tutorials/${book.slug}/${item.slug}`}
                            onClick={remember}
                            className={`block rounded-xl px-3 py-2 text-sm font-bold transition ${
                              isActive
                                ? "bg-ink text-white dark:bg-white dark:text-ink"
                                : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900"
                            }`}
                          >
                            <span className="block text-xs uppercase tracking-[0.18em] opacity-70">Chapter {item.number}</span>
                            <span className="line-clamp-2">{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                  No part map is available for this book yet.
                </div>
              )}

              {chapter.lessons?.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Lessons in this chapter</p>
                  <div className="mt-2 space-y-1">
                    {chapter.lessons.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/tutorials/${book.slug}/${chapter.slug}/${item.slug}`}
                        className={`block rounded-xl px-3 py-2 text-sm font-bold transition ${
                          lesson?.slug === item.slug
                            ? "bg-brand-50 text-brand-800 dark:bg-cyan-950/30 dark:text-cyan-200"
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-950"
                        }`}
                      >
                        Lesson {item.number}: {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <header className="border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm font-bold">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200">
                <Sparkles className="size-4" /> {book.category}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                {chapter.blocks.length} blocks
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                {currentLabel}: {currentTitle}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                Progress: {progressPercent}%
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                {readingTime} min read
              </span>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.26em] text-brand-600">AI/ML volume reader</p>
            <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-ink dark:text-white sm:text-5xl">
              {lesson ? `Lesson ${lesson.number}: ${lesson.title}` : chapter.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {lesson
                ? "This lesson is split out of the larger chapter so you can read it in shorter, focused sessions."
                : "Open a lesson below to continue in smaller steps, then come back here for the chapter overview."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleBookmark}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-black text-white dark:bg-white dark:text-ink"
              >
                <BookOpen className="size-4" /> {bookmarked ? "Saved" : "Bookmark"}
              </button>
              <button
                type="button"
                onClick={() => {
                  recordBookProgress({
                    bookSlug: book.slug,
                    chapterSlug: chapter.slug,
                    chapterNumber: currentUnit,
                    totalChapters: totalUnits
                  });
                  setProgressPercent(100);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 dark:border-slate-800 dark:text-slate-200"
              >
                <CheckCircle2 className="size-4 text-leaf" />
                Mark as complete
              </button>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                Save your place, keep the chapter progress tracked, and continue without losing context.
              </p>
            </div>
          </header>

          {lesson ? (
            <div className="grid gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_260px] xl:px-8">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-slate-500">
                    <Clock3 className="size-4" />
                    Lesson focus
                  </div>
                  <p className="text-base leading-7 text-slate-700 dark:text-slate-300">
                    {lesson.title}
                  </p>
                </div>
                <div className="space-y-4">
                  {currentBlocks.length === 0 ? (
                    <p className="rounded-2xl bg-amber-50 p-5 font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                      No lesson body text was available in the extracted DOCX stream.
                    </p>
                  ) : (
                    currentBlocks.map((block, index) => <LessonBlock key={`${block.type}-${index}`} block={block} id={`section-${index}`} />)
                  )}
                </div>
                <div className="grid gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 md:grid-cols-2">
                  {previousLesson ? (
                    <Link
                      href={`/tutorials/${book.slug}/${chapter.slug}/${previousLesson.slug}`}
                      onClick={remember}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-black dark:border-slate-800"
                    >
                      <ArrowLeft className="size-5" />
                      Previous lesson
                    </Link>
                  ) : (
                    <span />
                  )}
                  {nextLesson ? (
                    <Link
                      href={`/tutorials/${book.slug}/${chapter.slug}/${nextLesson.slug}`}
                      onClick={remember}
                      className="inline-flex items-center justify-end gap-2 rounded-xl bg-ink px-4 py-3 text-right font-black text-white dark:bg-white dark:text-ink"
                    >
                      Next lesson
                      <ArrowRight className="size-5" />
                    </Link>
                  ) : null}
                </div>
              </div>

              <aside className="h-max rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
                <div className="mb-4 flex items-center gap-2">
                  <ListChecks className="size-5 text-brand-600" />
                  <h2 className="font-black">On this page</h2>
                </div>
                <Outline headings={filteredHeadings} searchTerm={query} />
              </aside>
            </div>
          ) : (
            <div className="grid gap-6 px-6 py-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:px-8">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-500">Chapter overview</p>
                  <p className="mt-2 text-base leading-7 text-slate-700 dark:text-slate-300">{book.description}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {chapter.lessons?.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/tutorials/${book.slug}/${chapter.slug}/${item.slug}`}
                      onClick={remember}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Lesson {item.number}</p>
                      <h3 className="mt-2 text-xl font-black tracking-tight">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.readingTime ?? estimateReadingTime(item.blocks)} min read</p>
                    </Link>
                  ))}
                </div>
                {currentBlocks.length ? (
                  <div className="space-y-4">
                    {currentBlocks.slice(0, 4).map((block, index) => (
                      <LessonBlock key={`${block.type}-${index}`} block={block} id={`preview-${index}`} />
                    ))}
                  </div>
                ) : null}
              </div>
              <aside className="h-max rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24">
                <div className="mb-4 flex items-center gap-2">
                  <ListChecks className="size-5 text-brand-600" />
                  <h2 className="font-black">Quick nav</h2>
                </div>
                <Outline headings={filteredHeadings} searchTerm={query} />
                {chapter.lessons?.[0] ? (
                  <Link
                    href={`/tutorials/${book.slug}/${chapter.slug}/${chapter.lessons[0].slug}`}
                    onClick={remember}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-ink"
                  >
                    Continue reading
                    <ArrowRight className="size-4" />
                  </Link>
                ) : null}
              </aside>
            </div>
          )}
        </article>

        <button
          type="button"
          onClick={() => setOutlineOpen((value) => !value)}
          className="fixed bottom-20 right-5 z-40 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 xl:hidden"
        >
          <ListChecks className="size-5" /> Sections
        </button>

        {outlineOpen ? (
          <div className="fixed inset-x-4 bottom-36 z-50 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 xl:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black">On this page</h2>
              <button type="button" onClick={() => setOutlineOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <PanelLeftClose className="size-4" />
              </button>
            </div>
            <Outline headings={filteredHeadings} searchTerm={query} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LessonBlock({ block, id }: { block: LibraryBookBlock; id: string }) {
  if (block.type === "heading") {
    return (
      <h2 id={id} className="scroll-mt-24 border-t border-slate-200 pt-8 text-3xl font-black tracking-tight text-ink first:border-0 first:pt-0 dark:border-slate-800 dark:text-white">
        {stripNumbering(block.text)}
      </h2>
    );
  }

  if (block.type === "subheading") {
    return (
      <h3 id={id} className="scroll-mt-24 pt-6 text-xl font-extrabold text-slate-800 dark:text-slate-100">
        {stripNumbering(block.text)}
      </h3>
    );
  }

  if (block.type === "list") {
    return (
      <p className="my-3 flex gap-3 rounded-xl bg-slate-50 p-3 leading-7 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
        <CheckCircle2 className="mt-1 size-5 shrink-0 text-leaf" />
        <span>{block.text}</span>
      </p>
    );
  }

  if (block.type === "callout") {
    return (
      <p className="my-5 rounded-2xl border-l-4 border-brand-500 bg-cyan-50 p-5 font-semibold leading-7 text-cyan-950 dark:bg-cyan-950/30 dark:text-cyan-100">
        {block.text}
      </p>
    );
  }

  if (block.type === "table") {
    return <TableBlock text={block.text} id={id} />;
  }

  if (looksLikeCode(block.text)) {
    return (
      <pre className="my-5 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-cyan-100">
        <code>{block.text}</code>
      </pre>
    );
  }

  return <p className="my-4 text-[18px] leading-9 text-slate-700 dark:text-slate-300">{block.text}</p>;
}

function TableBlock({ text, id }: { text: string; id: string }) {
  const rows = text
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split("|").map((cell) => cell.trim()).filter(Boolean));

  if (!rows.length) {
    return <p id={id} className="my-4 text-[18px] leading-9 text-slate-700 dark:text-slate-300">{text}</p>;
  }

  return (
    <div id={id} className="my-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className={index === 0 ? "bg-slate-50 dark:bg-slate-950" : "bg-white dark:bg-slate-900"}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-r border-slate-200 px-4 py-3 align-top last:border-r-0 dark:border-slate-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Outline({ headings, searchTerm }: { headings: Array<LibraryBookBlock & { index: number }>; searchTerm: string }) {
  return (
    <nav className="max-h-[45vh] space-y-2 overflow-y-auto">
      {headings.length ? (
        headings.map((heading) => (
          <a
            key={`${heading.text}-${heading.index}`}
            href={`#section-${heading.index}`}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-ink dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {heading.text}
          </a>
        ))
      ) : (
        <p className="text-sm leading-6 text-slate-500">
          {searchTerm ? "No sections match your search." : "This lesson is mostly paragraph content."}
        </p>
      )}
    </nav>
  );
}

function looksLikeCode(text: string) {
  return /^(from |import |def |class |const |let |var |function |SELECT |CREATE |INSERT |UPDATE |DELETE |docker |uvicorn |pip )/.test(text);
}

function stripNumbering(text: string) {
  return text.replace(/^\d+(?:\.\d+)*\.?\s+/, "");
}

function estimateReadingTime(blocks: LibraryBookBlock[]) {
  const words = blocks
    .map((block) => block.text)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 180));
}
