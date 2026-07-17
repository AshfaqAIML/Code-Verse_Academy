import { Section } from "@/components/section";
import { Bot, BrainCircuit, GraduationCap, Users, Sparkles, NotebookTabs, ListChecks, BookOpen, Mic, PenLine, Code2, ArrowRight, MessageSquareMore, Monitor, Play } from "lucide-react";
import Link from "next/link";
import { getAICourses } from "@/lib/ai-classroom/courses";

const tools = [
  { title: "AI Classmates", description: "Multi-agent group discussion with beginner, intermediate, and advanced AI peers.", icon: Users, href: "/ai-classroom/classmates", color: "from-rose-400 to-orange-500" },
  { title: "Smart Quiz", description: "AI-generated quizzes from any lesson with timer, difficulty selector, and instant grading.", icon: ListChecks, href: "/ai-classroom/quiz", color: "from-emerald-400 to-teal-500" },
  { title: "Flashcards", description: "AI-generated flashcards for quick revision with 3D flip animation and keyboard navigation.", icon: NotebookTabs, href: "/ai-classroom/flashcards", color: "from-amber-400 to-orange-500" },
  { title: "Voice Learning", description: "Speak questions and listen to AI responses in 7 languages with speech recognition.", icon: Mic, href: "/ai-classroom/voice", color: "from-pink-400 to-rose-500" },
  { title: "AI Notes", description: "AI-generated structured notes with search, word count, and localStorage persistence.", icon: PenLine, href: "/ai-classroom/notes", color: "from-violet-400 to-purple-500" },
  { title: "Code Mentor", description: "AI-powered code reviews, debugging, optimization, and explanations across 10+ languages.", icon: Code2, href: "/ai-classroom/code-mentor", color: "from-blue-400 to-indigo-500" },
  { title: "AI Whiteboard", description: "Interactive Canvas drawing board with shapes, text, fill color, undo/redo, and PNG export.", icon: Sparkles, href: "/ai-classroom/whiteboard", color: "from-amber-400 to-orange-500" },
  { title: "AI Teacher", description: "Step-by-step explanations with examples, analogies, and interactive chat.", icon: GraduationCap, href: "/ai-classroom/teacher", color: "from-cyan-400 to-blue-500" },
  { title: "AI Interviewer", description: "Mock interviews with real-time feedback, scoring, and improvement tips.", icon: BrainCircuit, href: "/ai-classroom/interviewer", color: "from-violet-400 to-purple-500" },
];

const aiCourses = getAICourses();

export default function AIClassroomPage() {
  return (
    <>
      <section className="relative overflow-hidden px-4 py-14 sm:px-6 lg:py-20">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(236,254,255,.92),rgba(255,255,255,.82),rgba(247,250,255,.78))] dark:bg-[linear-gradient(135deg,rgba(2,6,23,.96),rgba(15,23,42,.9),rgba(30,12,52,.72))]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-brand-600">AI Classroom</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-ink dark:text-white sm:text-6xl">
              Your personal AI learning studio
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-700 dark:text-slate-300">
              AI teachers, assistants, and classmates guide you through every lesson. Generate quizzes, flashcards, notes, and interactive diagrams — all powered by AI.
            </p>
          </div>
        </div>
      </section>

      <Section eyebrow="AI Classroom" title="Interactive AI-Powered Lessons" copy="Enter any topic and get a full interactive lesson with slides, quizzes, and AI classmates discussing together.">
        <Link
          href="/ai-classroom/learn"
          className="group mb-8 block overflow-hidden rounded-3xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 via-white to-purple-50 transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl dark:border-brand-900 dark:from-brand-950/30 dark:via-slate-900 dark:to-purple-950/20 dark:hover:border-brand-600"
        >
          <div className="flex items-center gap-6 p-6 sm:p-8">
            <div className="hidden shrink-0 sm:block">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-lg">
                <Monitor className="size-10 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white">New</span>
                <h3 className="text-2xl font-black text-ink dark:text-white">Start a Lesson</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Enter any topic — AI generates a structured lesson with slides, a quiz, and a multi-agent discussion. Like a real classroom, but AI-powered.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-cyan-300">
                Try it now <Play className="size-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </Section>

      <Section eyebrow="Learning Tools" title="Everything you need to learn" copy="AI-powered study tools that work with any lesson content. Generate, practice, review, and master any topic.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >
                <div className={`h-2 bg-gradient-to-r ${tool.color}`} />
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-2xl bg-gradient-to-br ${tool.color} p-3`}>
                      <Icon className="size-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black">{tool.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{tool.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="AI Courses" title="Learn any course with AI guidance" copy="Open a course in AI Classroom mode. Your AI teacher will guide you through every chapter." className="bg-white/55 dark:bg-slate-900/35">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aiCourses.map((course) => (
            <Link
              key={course.slug}
              href={`/ai-classroom/${course.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`h-2 rounded-full bg-gradient-to-r ${course.color}`} />
              <h3 className="mt-4 text-lg font-black">{course.title}</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{course.category} &middot; {course.level}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400 line-clamp-2">{course.description}</p>
              <p className="mt-3 text-sm font-semibold text-slate-400">{course.book?.chapters.length ?? 0} chapters</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-cyan-300">
                Open in AI Classroom <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
