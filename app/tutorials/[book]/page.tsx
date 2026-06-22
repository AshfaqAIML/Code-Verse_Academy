import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock3, Layers3, Sparkles } from "lucide-react";
import { getLibraryBook, getLibraryBooks } from "@/lib/books";

type PageParams = Promise<{ book: string }>;

export function generateStaticParams() {
  return getLibraryBooks().map((book) => ({ book: book.slug }));
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { book: bookSlug } = await params;
  const book = getLibraryBook(bookSlug);

  if (!book) {
    return {};
  }

  const url = `https://code-verse-academy.vercel.app/tutorials/${book.slug}`;
  return {
    title: `${book.title} | CodeVerse Academy`,
    description: book.description,
    openGraph: {
      title: book.title,
      description: book.description,
      url,
      type: "article"
    },
    alternates: { canonical: url }
  };
}

export default async function TutorialBookPage({ params }: { params: PageParams }) {
  const { book: bookSlug } = await params;
  const book = getLibraryBook(bookSlug);
  if (!book) notFound();

  const estimatedMinutes = book.estimatedMinutes ?? Math.max(12, Math.round(book.chapters.length * 6));
  const totalLessons = book.lessons ?? book.chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length ?? 1), 0);

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: book.title,
              description: book.description,
              provider: {
                "@type": "Organization",
                name: "CodeVerse Academy",
                url: "https://code-verse-academy.vercel.app"
              },
              url: `https://code-verse-academy.vercel.app/tutorials/${book.slug}`
            })
          }}
        />
        <Link href="/tutorials" className="mb-6 inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-brand-700">
          <ArrowLeft className="size-4" /> Back to tutorials
        </Link>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white sm:p-10">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-200">{book.category}</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{book.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{book.description}</p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-cyan-100">
                <span className="rounded-full bg-white/10 px-4 py-2">{book.chapters.length} chapters</span>
                <span className="rounded-full bg-white/10 px-4 py-2">{totalLessons} lessons</span>
                <span className="rounded-full bg-white/10 px-4 py-2">{estimatedMinutes} min read</span>
                <span className="rounded-full bg-white/10 px-4 py-2">Auto-saved reading progress</span>
              </div>
              {book.parts?.length ? (
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {book.parts.slice(0, 3).map((part) => (
                    <div key={part.slug} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Part {part.number}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-100">{part.title}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              {book.chapters[0] ? (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/tutorials/${book.slug}/${book.chapters[0].slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-ink dark:bg-cyan-300"
                  >
                    Start reading <ArrowRight className="size-4" />
                  </Link>
                  <p className="text-sm leading-6 text-slate-300">
                    Open a chapter and continue lesson-by-lesson from the same place every time.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-4 p-6 sm:p-8">
              <div className="rounded-[28px] bg-slate-50 p-5 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="grid size-14 place-items-center rounded-2xl bg-ink text-white dark:bg-white dark:text-ink">
                    <BookOpen className="size-7" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Course card</p>
                    <p className="mt-1 text-2xl font-black tracking-tight">{book.title}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Metric label="Difficulty" value={book.level} />
                  <Metric label="Chapters" value={String(book.chapters.length)} />
                  <Metric label="Lessons" value={String(totalLessons)} />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Metric label="Reading time" value={`${estimatedMinutes} min`} />
                  <Metric label="Source" value="DOCX volume" />
                </div>
              </div>

              <div className="rounded-[28px] bg-slate-950 p-5 text-white">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-200">Learning mode</p>
                <p className="mt-3 text-xl font-black tracking-tight">Chapters, lessons and progress live in the same tutorial flow.</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Each chapter can hold multiple lessons and the reader remembers your progress while keeping the layout native to CodeVerse Academy.
                </p>
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">
                  <Sparkles className="size-4 text-cyan-200" />
                  Built for the tutorials section, not a separate book area.
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">
                  <Clock3 className="size-4 text-cyan-200" />
                  Estimated reading time: {estimatedMinutes} minutes
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">
                  <Layers3 className="size-4 text-cyan-200" />
                  {book.parts?.length ?? 0} parts and {book.chapters.length} chapters
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4">
          {(book.parts?.length ? book.parts : []).map((part) => (
            <div key={part.slug} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Part {part.number}</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">{part.title}</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {part.chapters.map((chapterSlug) => {
                  const chapter = book.chapters.find((item) => item.slug === chapterSlug);
                  if (!chapter) return null;
                  return (
                    <Link
                      key={chapter.slug}
                      href={`/tutorials/${book.slug}/${chapter.slug}`}
                      className="group grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Chapter {chapter.number}</p>
                          <h3 className="mt-1 text-xl font-black">{chapter.title}</h3>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                          {chapter.lessons?.length ?? 1} lessons
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {chapter.lessons?.length
                          ? `Open the chapter overview to read ${chapter.lessons.length} shorter lessons.`
                          : "Open the chapter reader to continue with the lesson content."}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-cyan-300">
                        Open chapter <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {!book.parts?.length ? (
          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {book.chapters.map((chapter, index) => (
              <Link
                key={`${book.slug}-${chapter.slug}-${chapter.number}-${index}`}
                href={`/tutorials/${book.slug}/${chapter.slug}`}
                className="group grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-xl font-black text-brand-700 dark:bg-slate-950 dark:text-cyan-300">
                  {chapter.number}
                </span>
                <span>
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                    <BookOpen className="size-4" />
                    Lesson
                  </span>
                  <span className="mt-2 block text-xl font-black">{chapter.title}</span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-cyan-300">
                  Read <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black tracking-tight text-ink dark:text-white">{value}</p>
    </div>
  );
}
