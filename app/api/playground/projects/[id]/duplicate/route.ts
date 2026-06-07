import { NextResponse } from "next/server";
import { getAuthUserFromHeaders } from "@/lib/auth";
import { createProjectId, readPlaygroundProjects, writePlaygroundProjects } from "@/lib/playground-store";

function getActorId(headers: Headers) {
  const user = getAuthUserFromHeaders(headers);
  return user?.email ?? "guest-user-id";
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actorId = getActorId(request.headers);
  const projects = await readPlaygroundProjects();
  const original = projects.find((project) => project.id === id);

  if (!original) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (original.userId !== actorId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const now = new Date().toISOString();
  const duplicate = {
    ...original,
    id: createProjectId(),
    title: `${original.title} (Copy)`,
    created_at: now,
    updated_at: now
  };

  projects.unshift(duplicate);
  await writePlaygroundProjects(projects);

  return NextResponse.json(duplicate, { status: 201 });
}
