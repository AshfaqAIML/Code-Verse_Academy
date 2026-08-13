"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Expand,
  Focus,
  ListChecks,
  Menu,
  Minus,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Trophy
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RevisionAssistant } from "@/components/revision/revision-assistant";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { LessonNotes } from "@/components/notes/lesson-notes";
import { CreateFlashcard } from "@/components/flashcards/create-flashcard";
import type { LibraryBookBlock, LibraryBookChapter } from "@/lib/books";
import { getBookProgress, recordBookProgress } from "@/lib/book-progress";
import { getBookmarks, recordRecentLearning, toggleBookmark } from "@/lib/learning-memory";

type ReaderBook = {
  slug: string;
  title: string;
  category: string;
  chapters: LibraryBookChapter[];
};

type Heading = LibraryBookBlock & { index: number };

type Props = {
  book: ReaderBook;
  chapter: LibraryBookChapter;
  previous: LibraryBookChapter | null;
  next: LibraryBookChapter | null;
  headings: Heading[];
  revisionContent: string;
  previousChapterOptions: Array<{
    number: number;
    slug: string;
    title: string;
    content: string;
  }>;
};

export function TutorialReader({ book, chapter, previous, next, headings, revisionContent, previousChapterOptions }: Props) {
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [wideRead, setWideRead] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [fontIndex, setFontIndex] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [progressPercent, setProgressPercent] = useState(Math.round((chapter.number / Math.max(book.chapters.length, 1)) * 100));
  const [bookmarked, setBookmarked] = useState(false);

  const FONT_SIZES = [17, 19, 21, 23];
  const fontSize = FONT_SIZES[fontIndex] ?? 19;

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setScrollProgress(max > 0 ? Math.min(100, Math.round((el.scrollTop / max) * 100)) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const readerGrid = focusMode
    ? "xl:grid-cols-[minmax(0,1fr)]"
    : wideRead
      ? "xl:grid-cols-[minmax(0,1fr)]"
      : chaptersOpen
        ? "xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)_280px]"
        : "xl:grid-cols-[minmax(0,1fr)_280px]";

  function rememberChapterBeforeNavigation() {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("codeverse-learning-memory");
      const parsed = raw ? JSON.parse(raw) : {};
      const completedTopics = [
        ...new Set([...(Array.isArray(parsed.completedTopics) ? parsed.completedTopics : []), `${book.title}: ${chapter.title}`])
      ].slice(-30);
      window.localStorage.setItem(
        "codeverse-learning-memory",
        JSON.stringify({ ...parsed, completedTopics, lastReadChapter: chapter.slug, lastStudiedAt: new Date().toISOString() })
      );
      recordBookProgress({
        bookSlug: book.slug,
        chapterSlug: chapter.slug,
        chapterNumber: chapter.number,
        totalChapters: book.chapters.length
      });
      recordRecentLearning({
        title: `${book.title} - ${chapter.title}`,
        href: `/tutorials/${book.slug}/${chapter.slug}`,
        kind: "book"
      });
    } catch {
      // Reading progress should never block navigation.
    }
  }

  useEffect(() => {
    const saved = getBookProgress(book.slug);
    setProgressPercent(saved?.progress ?? Math.round((chapter.number / Math.max(book.chapters.length, 1)) * 100));
    recordBookProgress({
      bookSlug: book.slug,
      chapterSlug: chapter.slug,
      chapterNumber: chapter.number,
      totalChapters: book.chapters.length
    });
    setBookmarked(getBookmarks().some((item) => item.href === `/tutorials/${book.slug}/${chapter.slug}`));
  }, [book.slug, book.chapters.length, chapter.slug, chapter.number]);

  const readingTime = useMemo(() => {
    const wordCount = chapter.blocks
      .map((block) => block.text)
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(3, Math.ceil(wordCount / 180));
  }, [chapter.blocks]);

  const activeChapterLabel = useMemo(() => `Lesson ${chapter.number}: ${chapter.title}`, [chapter.number, chapter.title]);
  const filteredHeadings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return headings;
    return headings.filter((heading) => heading.text.toLowerCase().includes(query));
  }, [headings, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950">
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-white dark:bg-slate-900">
        <div className="h-full bg-brand-500 transition-[width] duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>
      <div className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <Link href={`/tutorials/${book.slug}`} className="inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-cyan-300">
            <ArrowLeft className="size-4" /> {book.title}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setChaptersOpen((value) => !value)}>
              {chaptersOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
              Chapters
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setWideRead((value) => !value);
                setChaptersOpen(false);
                setOutlineOpen(false);
              }}
              disabled={focusMode}
            >
              {wideRead ? <Minimize2 className="size-4" /> : <Expand className="size-4" />}
              {wideRead ? "Normal view" : "Full read"}
            </Button>
            <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900" role="group" aria-label="Reading font size">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Decrease font size"
                disabled={fontIndex <= 0}
                onClick={() => setFontIndex((value) => Math.max(0, value - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="min-w-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">{fontSize}px</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Increase font size"
                disabled={fontIndex >= FONT_SIZES.length - 1}
                onClick={() => setFontIndex((value) => Math.min(FONT_SIZES.length - 1, value + 1))}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              variant={focusMode ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFocusMode((value) => !value)}
            >
              <Focus className="size-4" />
              {focusMode ? "Exit focus" : "Focus"}
            </Button>
            <label className="hidden min-w-[320px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 md:flex">
              <Search className="size-4" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search within this lesson..."
                className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </label>
          </div>
        </div>
      </div>

      <div className={`mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 ${readerGrid}`}>
        {!focusMode && chaptersOpen ? (
          <aside className="h-max rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Menu className="size-5 text-brand-600" />
                <h2 className="font-black">Chapters</h2>
              </div>
              <button type="button" onClick={() => setChaptersOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close chapters">
                <PanelLeftClose className="size-4" />
              </button>
            </div>
            <nav className="max-h-[72vh] space-y-1 overflow-y-auto pr-1 scrollbar-thin">
              {book.chapters.map((item, index) => (
                <Link
                  key={`${book.slug}-${item.slug}-${item.number}-${index}`}
                  href={`/tutorials/${book.slug}/${item.slug}`}
                  onClick={rememberChapterBeforeNavigation}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    item.slug === chapter.slug
                      ? "bg-ink text-white dark:bg-white dark:text-ink"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="block text-xs uppercase tracking-[0.18em] opacity-70">Lesson {item.number}</span>
                  <span className="line-clamp-2">{item.title}</span>
                </Link>
              ))}
            </nav>
          </aside>
        ) : null}

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <header className="border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm font-bold">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200">
                <BookOpen className="size-4" /> {book.category}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                {chapter.blocks.length} blocks
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                {activeChapterLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                Chapter {chapter.number} of {book.chapters.length}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                Progress: {progressPercent}%
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                {readingTime} min read
              </span>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.26em] text-brand-600">Tutorial lesson</p>
            <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-ink dark:text-white sm:text-5xl">
              {chapter.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button size="md" onClick={() => {
                  toggleBookmark({
                    title: `${book.title} - ${chapter.title}`,
                    href: `/tutorials/${book.slug}/${chapter.slug}`,
                    kind: "book"
                  });
                  setBookmarked((value) => !value);
                }}>
                <Bookmark className="size-4" /> {bookmarked ? "Saved for later" : "Bookmark"}
              </Button>
              <LessonNotes
                title={`${book.title} - ${chapter.title}`}
                href={`/tutorials/${book.slug}/${chapter.slug}`}
                kind="book"
              />
              <CreateFlashcard
                title={`${book.title} - ${chapter.title}`}
                href={`/tutorials/${book.slug}/${chapter.slug}`}
                kind="book"
              />
              <Link
                href={`/practice?track=${book.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-leaf px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2 dark:ring-offset-slate-950"
              >
                <Trophy className="size-4" />
                Practice this topic
              </Link>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                Save this chapter and come back without losing your place.
              </p>
            </div>
          </header>

          <div className="mx-auto max-w-5xl px-6 py-8 sm:px-9">
            <RevisionAssistant
              topic={book.title}
              chapterTitle={chapter.title}
              learningPath={book.category}
              content={revisionContent}
              previousChapters={previousChapterOptions}
            />

            <div className="mt-8" style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}>
              {chapter.blocks.length === 0 ? (
                <p className="rounded-2xl bg-amber-50 p-5 font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  This chapter title exists in the document, but no body text was available in the extracted DOCX stream.
                </p>
              ) : (
                chapter.blocks.map((block, index) => <TutorialBlock key={`${block.type}-${index}`} block={block} id={`section-${index}`} />)
              )}
            </div>
          </div>

          <footer className="grid gap-3 border-t border-slate-200 p-5 dark:border-slate-800 md:grid-cols-2">
            {previous ? (
              <Link
                href={`/tutorials/${book.slug}/${previous.slug}`}
                onClick={rememberChapterBeforeNavigation}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-black dark:border-slate-800"
              >
                <ChevronLeft className="size-5" /> Previous: {previous.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/tutorials/${book.slug}/${next.slug}`}
                onClick={rememberChapterBeforeNavigation}
                className="inline-flex items-center justify-end gap-2 rounded-xl bg-ink px-4 py-3 text-right font-black text-white dark:bg-white dark:text-ink"
              >
                Next: {next.title} <ChevronRight className="size-5" />
              </Link>
            ) : null}
          </footer>
        </article>

        {!focusMode && !wideRead ? (
          <aside className="hidden h-max rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24 xl:block">
            <div className="mb-4 flex items-center gap-2">
              <ListChecks className="size-5 text-brand-600" />
              <h2 className="font-black">On this page</h2>
            </div>
            <Outline headings={filteredHeadings} searchTerm={searchTerm} />
          </aside>
        ) : null}
      </div>

      {!focusMode ? (
        <button
          type="button"
          onClick={() => setOutlineOpen((value) => !value)}
          className="fixed bottom-20 right-5 z-40 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 xl:hidden"
        >
          <ListChecks className="size-5" /> Sections
        </button>
      ) : null}

      {!focusMode && outlineOpen ? (
        <div className="fixed inset-x-4 bottom-36 z-50 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 xl:hidden">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black">On this page</h2>
            <button type="button" onClick={() => setOutlineOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Minimize2 className="size-4" />
            </button>
          </div>
          <Outline headings={filteredHeadings} searchTerm={searchTerm} />
        </div>
      ) : null}
    </div>
  );
}

function Outline({ headings, searchTerm }: { headings: Heading[]; searchTerm: string }) {
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
          {searchTerm ? "No sections match your search." : "This chapter is mostly paragraph content."}
        </p>
      )}
    </nav>
  );
}

function TutorialBlock({ block, id }: { block: LibraryBookBlock; id: string }) {
  if (block.type === "code" || looksLikeCode(block.text) || block.text.includes("\n")) {
    return <CodeBlock code={restoreCodeFormatting(block.text)} />;
  }

  if (block.type === "heading") {
    return (
      <h2 id={id} className="group/heading scroll-mt-24 border-t border-slate-200 pt-10 text-3xl font-black tracking-tight text-ink first:border-0 first:pt-0 dark:border-slate-800 dark:text-white">
        {stripNumbering(block.text)}
        <CopyLinkButton id={id} className="ml-3 align-middle opacity-0 transition group-hover/heading:opacity-100" />
      </h2>
    );
  }

  if (block.type === "subheading") {
    return (
      <h3 id={id} className="group/heading scroll-mt-24 pt-7 text-xl font-extrabold text-slate-800 dark:text-slate-100">
        {stripNumbering(block.text)}
        <CopyLinkButton id={id} className="ml-2 align-middle opacity-0 transition group-hover/heading:opacity-100" />
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
      <p className="my-5 whitespace-pre-wrap rounded-2xl border-l-4 border-brand-500 bg-cyan-50 p-5 font-semibold leading-7 text-cyan-950 dark:bg-cyan-950/30 dark:text-cyan-100">
        {block.text}
      </p>
    );
  }

  if (block.type === "table") {
    return <TableBlock text={block.text} id={id} />;
  }

  return <p className="my-4 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{block.text}</p>;
}

function TableBlock({ text, id }: { text: string; id: string }) {
  const rows = text
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split("|").map((cell) => cell.trim()).filter(Boolean));

  if (!rows.length) {
    return <p id={id} className="my-4 leading-7 text-slate-700 dark:text-slate-300">{text}</p>;
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

function looksLikeCode(text: string) {
  return (
    /^(from |import |def |class |const |let |var |function |SELECT |CREATE |INSERT |UPDATE |DELETE |docker |uvicorn |pip )/.test(text) ||
    /(?:Input:|Output:|→|=>)/.test(text) ||
    /[A-Za-z_][\w]*\s*=/.test(text) ||
    /\b(?:print|len|sum|sorted|range|int|float|str|list|dict|set|type|open|input|id|isinstance|enumerate|zip|map|filter|reduce|reversed|abs|max|min|round)\(/.test(text) ||
    /^\d+$/.test(text.trim()) ||
    /^(True|False|None)$/.test(text.trim()) ||
    /^\d+[A-Za-z_]/.test(text) ||
    /\)\d/.test(text) ||
    /\b(?:for |while |if |elif |else:|def |class |try:|except|with |return |yield |async |await |import |from |raise )/.test(text)
  );
}

function restoreCodeFormatting(text: string) {
  let formatted = text.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  formatted = formatted.replace(/(?<=\S)(?=(?:Input:|Output:|Example Output))/g, "\n");
  formatted = formatted.replace(/(?<=\S)(?=(?:from |import |def |class |const |let |var |function |print\(|SELECT |CREATE |INSERT |UPDATE |DELETE ))/g, "\n");
  formatted = formatted.replace(/(#[ \t]*(?:Integer|Float|String|Boolean))([a-z_][\w]*\s*=)/g, "$1\n$2");
  formatted = formatted.replace(/(?<=[0-9"'`\]\)])(?=\s*[A-Za-z_][\w]*\s*=)/g, "\n");
  formatted = formatted.replace(/(?<=[A-Za-z0-9"'`\]\)])(?=print\()/g, "\n");
  formatted = formatted.replace(/(?<=[0-9])(?=Output:)/g, "\n");
  formatted = formatted.replace(/([a-z])(\d\s*[*/+\->])/g, "$1\n$2");
  formatted = formatted.replace(/([a-z])(?=\d+\s*→)/g, "$1\n");
  return formatted.replace(/\n{3,}/g, "\n\n");
}

function stripNumbering(text: string) {
  return text.replace(/^\d+(?:\.\d+)*\.?\s+/, "");
}
