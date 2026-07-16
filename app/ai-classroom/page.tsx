import { Section } from "@/components/section";
import { Bot, BrainCircuit, GraduationCap, Users, Sparkles, NotebookTabs, ListChecks, BookOpen, Mic, PenLine, Code2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAICourses } from "@/lib/ai-classroom/courses";

const agents = [
  {
    title: "AI Teacher",
    description: "Explains concepts step by step with diagrams, examples, and interactive whiteboard.",
    icon: GraduationCap,
    href: "/ai-classroom/teacher",
    color: "from-cyan-400 to-blue-500"
  },
  {
    title: "AI Assistant",
    description: "Simplifies difficult topics, explains terminology, and creates summaries on demand.",
    icon: Bot,
    href: "/ai-classroom/assistant",
    color: "from-emerald-400 to-teal-500"
  },
  {
    title: "AI Interviewer",
    description: "Conducts mock interviews with real-time feedback, scoring, and improvement tips.",
    icon: BrainCircuit,
    href: "/ai-classroom/interviewer",
    color: "from-violet-400 to-purple-500"
  },
  {
    title: "AI Classmates",
    description: "Learn with AI peers who ask questions, discuss concepts, and simulate a real classroom.",
    icon: Users,
    href: "/ai-classroom/classmates",
    color: "from-rose-400 to-orange-500"
  }
];

const tools = [
  { title: "Smart Quiz", description: "Auto-generated quizzes from any lesson with instant grading.", icon: ListChecks, href: "/ai-classroom/quiz" },
  { title: "Flashcards", description: "AI-generated flashcards for quick revision and spaced repetition.", icon: NotebookTabs, href: "/ai-classroom/flashcards" },
  { title: "Voice Learning", description: "Listen to lessons, ask questions by voice, and practice speaking.", icon: Mic, href: "/ai-classroom/voice" },
  { title: "AI Notes", description: "Auto-generated structured notes with key concepts and summaries.", icon: PenLine, href: "/ai-classroom/notes" },
  { title: "Code Mentor", description: "Get code reviews, bug detection, and optimization suggestions.", icon: Code2, href: "/ai-classroom/code-mentor" },
  { title: "AI Whiteboard", description: "Interactive diagrams, flowcharts, and visual explanations.", icon: Sparkles, href: "/ai-classroom/whiteboard" }
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

      <Section eyebrow="AI Agents" title="Meet your AI learning team" copy="Each agent has a unique role. Ask questions, get explanations, practice interviews, and learn together with AI classmates.">
        <div className="grid gap-5 md:grid-cols-2">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <Link
                key={agent.title}
                href={agent.href}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl hover:shadow-cyan-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >
                <div className={`h-2 bg-gradient-to-r ${agent.color}`} />
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-2xl bg-gradient-to-br ${agent.color} p-3`}>
                      <Icon className="size-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black">{agent.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{agent.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-brand-700 dark:text-cyan-300">
                    Open {agent.title} <Bot className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="Learning Tools" title="Study tools powered by AI" copy="Generate study materials from any lesson automatically — quizzes, flashcards, notes, diagrams, and more." className="bg-white/55 dark:bg-slate-900/35">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-lg hover:shadow-cyan-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >
                <Icon className="size-7 text-brand-600" />
                <h3 className="mt-4 text-lg font-black">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{tool.description}</p>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="AI Courses" title="Learn any course with AI guidance" copy="Open a course in AI Classroom mode. Your AI teacher will guide you through every chapter.">
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
