import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { writeCollection, readCollection } from "@/lib/file-store";
import { tutorialContent, courses } from "@/lib/data";
import blogData from "@/data/blogs.json";

const courseMap = new Map(courses.map((c) => [c.slug, c]));

function mergeCourseData(slug: string, content: Record<string, unknown>) {
  const course = courseMap.get(slug);
  return {
    slug,
    title: course?.title ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    category: course?.category ?? "Programming",
    level: course?.level ?? "Beginner",
    lessons: course?.lessons ?? 0,
    description: course?.description ?? "",
    chapters: course?.chapters ?? [],
    color: course?.color ?? "from-blue-400 to-indigo-600",
    certificate: course?.certificate ?? true,
    ...content,
  };
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const { type } = await request.json().catch(() => ({ type: "all" }));
  const results = { tutorials: 0, blogs: 0 };

  if (type === "all" || type === "tutorials") {
    const tutorials = Object.entries(tutorialContent).map(([slug, content]) =>
      mergeCourseData(slug, content as Record<string, unknown>)
    );
    writeCollection("tutorials", tutorials);
    results.tutorials = tutorials.length;
  }

  if (type === "all" || type === "blogs") {
    const blogs = blogData.articles.map((a) => ({ ...a, published: true }));
    writeCollection("blogs", blogs);
    results.blogs = blogs.length;
  }

  return NextResponse.json({ success: true, migrated: results });
}
