import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, FileQuestion } from "lucide-react";
import { Section } from "@/components/section";
import { TutorialBookGrid } from "@/components/tutorials/tutorial-book-grid";
import { learningSheets, mockTests, supportFeatures, tutorialArticles, tutorialTracks } from "@/lib/data";
import { getLibraryBooks } from "@/lib/books";

export default function TutorialsPage() {
  const books = getLibraryBooks();

  return (
    <>
      <section className="relative overflow-hidden px-4 py-14 sm:px-6 lg:py-20">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(236,254,255,.92),rgba(255,255,255,.82),rgba(255,247,237,.78))] dark:bg-[linear-gradient(135deg,rgba(2,6,23,.96),rgba(15,23,42,.9),rgba(8,47,73,.72))]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-brand-600">Tutorials</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-ink dark:text-white sm:text-6xl">
              Simple tutorials for coding, core subjects and interviews
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700 dark:text-slate-300">
              Pick a topic, read short notes, run examples, solve questions and revise with mock tests.
            </p>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Book library"
        title="Full-length books, structured as courses"
        copy="Uploaded DOCX books with chapter navigation, progress tracking and a clean reading layout."
      >
        <TutorialBookGrid books={books} />
      </Section>



      <Section
        eyebrow="Explore topics"
        title="Choose what you want to learn"
        copy="Each topic is split into small lessons, easy examples, practice tasks and revision notes."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tutorialTracks.map((track) => {
            const Icon = track.icon;
            return (
              <Link
                key={track.title}
                href={track.slug === "python-backend-development" ? `/tutorials/${track.slug}` : `/tutorial/${track.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl hover:shadow-cyan-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon className="size-8 text-brand-600" />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {track.level}
                  </span>
                </div>
                <h2 className="mt-8 text-2xl font-black tracking-tight">{track.title}</h2>
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600 dark:text-slate-300">{track.text}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {track.topics.map((topic) => (
                    <span key={topic} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 dark:border-slate-800">
                      {topic}
                    </span>
                  ))}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-cyan-300">
                  Start tutorial <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Latest lessons"
        title="Short notes with easy language"
        copy="These lessons use small examples first, then practice questions to help the idea stick."
        className="bg-white/55 dark:bg-slate-900/35"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {tutorialArticles.map((article) => (
            <article key={article.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
                  {article.track}
                </span>
                <span className="text-xs font-bold text-slate-500">{article.readTime}</span>
              </div>
              <BookOpen className="mb-5 size-6 text-brand-600" />
              <h3 className="text-xl font-black">{article.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{article.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Revision sheets"
        title="Practice lists for placement prep"
        copy="Use these sheets when you want a clear checklist before interviews, tests or project reviews."
      >
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[28px] bg-ink p-7 text-white dark:bg-white dark:text-ink">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300 dark:text-cyan-700">All-in-one prep</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Learn theory, then solve problems.</h2>
            <p className="mt-4 leading-7 text-slate-300 dark:text-slate-600">
              Start with notes, watch the example, try a quiz, then solve a small task in the playground.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {learningSheets.map((sheet) => (
              <div key={sheet} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <CheckCircle2 className="size-5 text-leaf" />
                <span className="font-black">{sheet}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Mock tests"
        title="Check what you know"
        copy="Take quick tests, see weak areas and revise the exact topic you missed."
        className="pt-0"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {mockTests.map((test) => (
            <article key={test.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <FileQuestion className="mb-8 size-7 text-brand-600" />
              <h3 className="text-xl font-black">{test.title}</h3>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600 dark:text-slate-300">{test.text}</p>
              <p className="mt-4 text-sm font-black text-leaf">{test.questions} questions</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Support" title="Everything around the lesson is useful" copy="The platform includes roadmaps, doubt support, sheets and certificates so learning stays organized.">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {supportFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <Icon className="mb-8 size-7 text-brand-600" />
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
