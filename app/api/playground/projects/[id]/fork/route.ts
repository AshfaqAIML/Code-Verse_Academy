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

  const now = new Date().toISOString();
  const fork = {
    ...original,
    id: createProjectId(),
    userId: actorId,
    title: `Fork: ${original.title}`,
    created_at: now,
    updated_at: now
  };

  projects.unshift(fork);
  await writePlaygroundProjects(projects);

  return NextResponse.json(fork, { status: 201 });
}
