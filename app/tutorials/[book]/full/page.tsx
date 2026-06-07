import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenText, ChevronRight, ListChecks } from "lucide-react";
import { getLibraryBook, getLibraryBooks, type LibraryBookBlock } from "@/lib/books";

export function generateStaticParams() {
  return getLibraryBooks().map((book) => ({ book: book.slug }));
}

export default async function FullTutorialBookPage({ params }: { params: Promise<{ book: string }> }) {
  const { book: bookSlug } = await params;
  const book = getLibraryBook(bookSlug);
  if (!book) notFound();

  const totalBlocks = book.chapters.reduce((sum, chapter) => sum + chapter.blocks.length, 0);
  const firstChapter = book.chapters[0];

  return (
    <div className="bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <Link href={`/tutorials/${book.slug}`} className="inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-cyan-300">
          <ArrowLeft className="size-4" /> Back to {book.title}
        </Link>

        <section className="mt-5 rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-200">{book.category}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{book.title} Full Book</h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">{book.description}</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-cyan-100">
            <span className="rounded-full bg-white/10 px-4 py-2">{book.chapters.length} chapters</span>
            <span className="rounded-full bg-white/10 px-4 py-2">{totalBlocks} blocks</span>
            <span className="rounded-full bg-white/10 px-4 py-2">All extracted chapter content</span>
          </div>
          {firstChapter ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/tutorials/${book.slug}/${firstChapter.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-ink dark:bg-cyan-300"
              >
                Open chapter 1 <ChevronRight className="size-4" />
              </Link>
              <p className="text-sm leading-6 text-slate-300">Scroll through the book below or jump into a specific chapter.</p>
            </div>
          ) : null}
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="h-max rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-6">
            <div className="flex items-center gap-2">
              <ListChecks className="size-5 text-brand-600" />
              <h2 className="font-black">Chapters</h2>
            </div>
            <nav className="mt-4 max-h-[72vh] space-y-1 overflow-y-auto pr-1 scrollbar-thin">
              {book.chapters.map((chapter) => (
                <a
                  key={chapter.slug}
                  href={`#${chapter.slug}`}
                  className="block rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                >
                  <span className="block text-xs uppercase tracking-[0.18em] opacity-70">Chapter {chapter.number}</span>
                  <span className="line-clamp-2">{chapter.title}</span>
                </a>
              ))}
            </nav>
          </aside>

          <main className="space-y-6">
            {book.chapters.map((chapter) => (
              <section key={chapter.slug} id={chapter.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <header className="border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:px-8">
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-brand-600 dark:text-cyan-300">Chapter {chapter.number}</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white">{chapter.title}</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{chapter.blocks.length} extracted blocks from the source DOCX</p>
                </header>

                <div className="px-6 py-6 sm:px-8">
                  <div className="space-y-4">
                    {chapter.blocks.map((block, index) => (
                      <FullBookBlock key={`${chapter.slug}-${index}`} block={block} id={`${chapter.slug}-block-${index}`} />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/tutorials/${book.slug}/${chapter.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-ink"
                    >
                      <BookOpenText className="size-4" />
                      Open chapter reader
                    </Link>
                    <a href={`#${book.chapters[Math.min(chapter.number, book.chapters.length - 1)]?.slug ?? chapter.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 dark:border-slate-800 dark:text-slate-200">
                      Next chapter in book
                    </a>
                  </div>
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}

function FullBookBlock({ block, id }: { block: LibraryBookBlock; id: string }) {
  if (block.type === "heading") {
    return (
      <h3 id={id} className="scroll-mt-24 border-t border-slate-200 pt-8 text-2xl font-black tracking-tight text-ink first:border-0 first:pt-0 dark:border-slate-800 dark:text-white">
        {stripNumbering(block.text)}
      </h3>
    );
  }

  if (block.type === "subheading") {
    return (
      <h4 id={id} className="scroll-mt-24 pt-5 text-lg font-extrabold text-slate-800 dark:text-slate-100">
        {stripNumbering(block.text)}
      </h4>
    );
  }

  if (block.type === "list") {
    return (
      <p className="flex gap-3 rounded-xl bg-slate-50 p-3 leading-7 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-500" />
        <span>{block.text}</span>
      </p>
    );
  }

  if (block.type === "callout") {
    return (
      <p className="rounded-2xl border-l-4 border-brand-500 bg-cyan-50 p-5 font-semibold leading-7 text-cyan-950 dark:bg-cyan-950/30 dark:text-cyan-100">
        {block.text}
      </p>
    );
  }

  if (looksLikeCode(block.text)) {
    return (
      <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-cyan-100">
        <code>{block.text}</code>
      </pre>
    );
  }

  return <p className="text-[17px] leading-8 text-slate-700 dark:text-slate-300">{block.text}</p>;
}

function looksLikeCode(text: string) {
  return /^(from |import |def |class |const |let |var |function |SELECT |CREATE |INSERT |UPDATE |DELETE |docker |uvicorn |pip |<!DOCTYPE|<html|<body|<head)/.test(text);
}

function stripNumbering(text: string) {
  return text.replace(/^\d+(?:\.\d+)*\.?\s+/, "");
}
