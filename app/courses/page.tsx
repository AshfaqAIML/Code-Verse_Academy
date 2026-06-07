import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Section } from "@/components/section";
import { courses, learningSheets, mockTests, tutorialTracks } from "@/lib/data";

const filterLabels = [
  { key: "all", label: "All" },
  { key: "dsa", label: "DSA" },
  { key: "web", label: "Web" },
  { key: "programming", label: "Programming" },
  { key: "data", label: "Data" },
  { key: "ai-ml", label: "AI/ML" },
  { key: "backend", label: "Backend" },
  { key: "cs-core", label: "CS Core" },
  { key: "projects", label: "Projects" }
] as const;

const projectCourseSlugs = new Set([
  "react-product-engineering",
  "node-api-studio",
  "python-backend-development",
  "python-data-analysis",
  "machine-learning-launchpad",
  "deep-learning-visualized"
]);

type CourseFilter = (typeof filterLabels)[number]["key"];

function resolveFilter(value: string | string[] | undefined): CourseFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  return filterLabels.some((filter) => filter.key === raw) ? (raw as CourseFilter) : "all";
}

function filterCourses(activeFilter: CourseFilter) {
  if (activeFilter === "all") {
    return courses;
  }

  if (activeFilter === "web") {
    return courses.filter((course) => course.category === "Web" || course.slug === "javascript-mastery" || course.title.toLowerCase().includes("javascript"));
  }

  if (activeFilter === "cs-core") {
    return courses.filter((course) => course.category === "Interview");
  }

  if (activeFilter === "projects") {
    return courses.filter((course) => projectCourseSlugs.has(course.slug));
  }

  return courses.filter((course) => course.category.toLowerCase() === activeFilter.toLowerCase());
}

export default async function CoursesPage({ searchParams }: { searchParams?: Promise<{ category?: string | string[] }> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const activeFilter = resolveFilter(resolvedSearchParams?.category);
  const visibleCourses = filterCourses(activeFilter);

  return (
    <>
      <Section
        eyebrow="Course catalog"
        title="Choose a course and follow the path"
        copy="Courses are split into small sections with lessons, practice questions, quizzes, notes, doubt help, progress tracking and certificates."
      >
        <div className="mb-6 flex flex-wrap gap-2">
          {filterLabels.map((filter) => (
            <Link
              key={filter.key}
              href={`/courses?category=${filter.key}`}
              aria-current={activeFilter === filter.key ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                activeFilter === filter.key
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-cyan-400 dark:bg-cyan-950/40 dark:text-cyan-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
        {!visibleCourses.length ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            No courses matched this category yet.
          </div>
        ) : null}
      </Section>

      <Section
        eyebrow="Tutorial topics"
        title="Quick topic groups"
        copy="Use these groups when you want short notes instead of a full course."
        className="pt-0"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tutorialTracks.map((track) => {
            const Icon = track.icon;
            return (
              <div key={track.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <Icon className="mb-6 size-7 text-brand-600" />
                <h3 className="text-xl font-black">{track.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{track.text}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {track.topics.slice(0, 4).map((topic) => (
                    <span key={topic} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Practice and revision"
        title="Sheets and mock tests"
        copy="Revise core subjects and check your understanding with small tests."
        className="pt-0"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black">Learning sheets</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {learningSheets.map((sheet) => (
                <div key={sheet} className="rounded-xl bg-slate-50 p-4 text-sm font-black dark:bg-slate-950">
                  {sheet}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-black">Mock tests</h3>
            <div className="mt-5 space-y-3">
              {mockTests.map((test) => (
                <div key={test.title} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <div>
                    <p className="font-black">{test.title}</p>
                    <p className="text-sm text-slate-500">{test.text}</p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-brand-700 dark:text-cyan-300">{test.questions} Qs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
