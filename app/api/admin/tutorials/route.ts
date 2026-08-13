import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { readCollection, upsertOne } from "@/lib/file-store";
import { tutorialContent, courses } from "@/lib/data";
import { parseAdminBody, validateSlug, validateString } from "@/lib/api-validation";

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

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const tutorials = await readCollection("tutorials");
    if (tutorials.length === 0) {
      const seeded = Object.entries(tutorialContent).map(([slug, content]) =>
        mergeCourseData(slug, content as Record<string, unknown>)
      );
      return NextResponse.json({ tutorials: seeded });
    }
    return NextResponse.json({ tutorials });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const parsed = await parseAdminBody(request);
    if (!parsed.ok) return parsed.error;

    const slug = validateSlug(parsed.body.slug);
    if (!slug || !validateString(parsed.body.title)) {
      return NextResponse.json({ error: "A valid slug and title are required" }, { status: 400 });
    }

    const existing = (await readCollection("tutorials")).find((t) => (t as { slug: string }).slug === slug);
    if (existing) {
      return NextResponse.json({ error: "A tutorial with this slug already exists" }, { status: 409 });
    }
    const tutorial = await upsertOne("tutorials", { ...parsed.body, slug });
    return NextResponse.json({ tutorial }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
