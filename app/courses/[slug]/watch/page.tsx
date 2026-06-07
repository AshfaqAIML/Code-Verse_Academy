import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { courses } from "@/lib/data";

export default async function CourseWatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);

  if (!course) notFound();

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/courses" className="mb-6 inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-brand-700">
          <ArrowLeft className="size-4" /> Back to courses
        </Link>

        <section className="grid gap-6 rounded-[28px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-brand-600">{course.category}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-ink dark:text-white">{course.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Video lessons coming soon. This course currently includes reading material and practice exercises.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Read", "Book chapters and structured reading"],
                ["Watch", "Video lessons coming soon"],
                ["Practice", "Topic tasks and quiz questions"]
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-4 shadow-xl shadow-black/20 dark:border-slate-800">
            <div className="flex aspect-video items-center justify-center rounded-[22px] border border-dashed border-cyan-400/50 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.16),rgba(15,23,42,.98))] text-cyan-100">
              <div className="text-center">
                <PlayCircle className="mx-auto size-14 text-cyan-300" />
                <p className="mt-4 text-lg font-black">Placeholder thumbnail</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-cyan-100/75">
                  No video player is enabled yet. This space is ready for future lesson videos and course trailers.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-sm leading-6 text-slate-300">
              <p className="font-black text-white">Future-ready structure</p>
              <p className="mt-2">
                When videos are added later, this route can render them without changing the course card layout or the learning flow.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
