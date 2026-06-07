import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AnimatedHero } from "@/components/animated-hero";
import { LearningHub } from "@/components/learning-hub";
import { LearningChart, SkillChart } from "@/components/charts";
import { Section } from "@/components/section";
import { getLibraryBooks } from "@/lib/books";
import { categories, courses, learningSheets, mentors, supportFeatures, testimonials } from "@/lib/data";

export default function HomePage() {
  const books = getLibraryBooks();

  return (
    <>
      <AnimatedHero />
      <LearningHub books={books} />
      <Section
        eyebrow="Learning paths"
        title="Learn from basics, then practice for real interviews"
        copy="Start with simple lessons, follow a clear path, solve practice sheets, build projects and track your progress."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl hover:shadow-cyan-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >
                <Icon className="mb-8 size-8 text-brand-600 transition group-hover:scale-110" />
                <h3 className="text-xl font-black">{category.name}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">{category.count}</p>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="How learning works"
        title="Simple support for serious progress"
        copy="The platform keeps the learning path clear: watch, read, code, ask doubts, practice, revise and finish with proof."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {supportFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <Icon className="mb-8 size-8 text-brand-600" />
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Practice sheets"
        title="Revise topic-wise before interviews"
        copy="Use short sheets for the topics students are asked most often in placements and technical rounds."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {learningSheets.map((sheet, index) => (
            <div key={sheet} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Sheet {index + 1}</p>
                <h3 className="mt-2 text-lg font-black">{sheet}</h3>
              </div>
              <ArrowRight className="size-5 text-brand-600" />
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Premium dashboard"
        title="Track skill growth, XP and learning momentum"
        copy="A learner can see streaks, completed lessons, weak topics, recent lessons, notes and daily challenge progress from one responsive workspace."
      >
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">Weekly XP</h3>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
                +18% this week
              </span>
            </div>
            <LearningChart />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">Skill mastery</h3>
              <span className="text-sm font-bold text-slate-500">Live profile</span>
            </div>
          <SkillChart />
          </div>
        </div>
      </Section>

      <Section eyebrow="Student proof" title="Designed for practical confidence">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.name} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <CheckCircle2 className="mb-5 size-6 text-leaf" />
              <blockquote className="text-base leading-7 text-slate-700 dark:text-slate-300">&ldquo;{item.text}&rdquo;</blockquote>
              <figcaption className="mt-6">
                <p className="font-black">{item.name}</p>
                <p className="text-sm text-slate-500">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section eyebrow="Mentors" title="Guidance from people who explain things simply">
        <div className="grid gap-5 md:grid-cols-2">
          {mentors.map((mentor) => (
            <div key={mentor.name} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-leaf text-xl font-black text-white">
                {mentor.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <h3 className="mt-5 text-2xl font-black">{mentor.name}</h3>
              <p className="mt-1 text-sm font-bold text-brand-700 dark:text-cyan-300">{mentor.role}</p>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{mentor.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[28px] bg-ink p-8 text-white dark:bg-white dark:text-ink md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300 dark:text-cyan-700">Ready for class</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Open your next lesson and start building.</h2>
          </div>
          <Link href="/playground" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-ink dark:bg-ink dark:text-white">
            Launch playground <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
