import { NextResponse } from "next/server";
import { getAuthUserFromHeaders } from "@/lib/auth";
import { createProjectId, normalizeLibraries, readPlaygroundProjects, writePlaygroundProjects } from "@/lib/playground-store";

function getActorId(headers: Headers) {
  const user = getAuthUserFromHeaders(headers);
  return user?.email ?? "guest-user-id";
}

export async function GET(request: Request) {
  const actorId = getActorId(request.headers);
  const projects = await readPlaygroundProjects();
  const visibleProjects = projects.filter((project) => project.userId === actorId);
  return NextResponse.json({ projects: visibleProjects });
}

export async function POST(request: Request) {
  const actorId = getActorId(request.headers);
  const body = await request.json().catch(() => ({}));
  const projects = await readPlaygroundProjects();

  const now = new Date().toISOString();
  const project = {
    id: createProjectId(),
    userId: actorId,
    title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Untitled Project",
    html: typeof body.html === "string" ? body.html : "",
    css: typeof body.css === "string" ? body.css : "",
    javascript: typeof body.javascript === "string" ? body.javascript : "",
    cdn_libraries: normalizeLibraries(body.cdn_libraries),
    is_public: Boolean(body.is_public),
    view_count: 0,
    created_at: now,
    updated_at: now
  };

  projects.unshift(project);
  await writePlaygroundProjects(projects);

  return NextResponse.json(project, { status: 201 });
}
