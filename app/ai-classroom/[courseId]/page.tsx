import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAICourse } from "@/lib/ai-classroom/courses";
import { ClassroomShell } from "@/components/ai-classroom/classroom-shell";

type PageParams = Promise<{ courseId: string }>;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { courseId } = await params;
  const course = getAICourse(courseId);
  if (!course) return {};
  return {
    title: `${course.title} | AI Classroom | CodeVerse Academy`,
    description: course.description,
  };
}

export default async function AIClassroomCoursePage({ params }: { params: PageParams }) {
  const { courseId } = await params;
  const course = getAICourse(courseId);
  if (!course) notFound();

  return <ClassroomShell course={course} />;
}
