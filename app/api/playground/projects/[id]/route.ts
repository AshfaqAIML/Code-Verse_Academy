import { NextResponse } from "next/server";
import { getAuthUserFromHeaders } from "@/lib/auth";
import { normalizeLibraries, readPlaygroundProjects, writePlaygroundProjects } from "@/lib/playground-store";

function getActorId(headers: Headers) {
  const user = getAuthUserFromHeaders(headers);
  return user?.email ?? "guest-user-id";
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projects = await readPlaygroundProjects();
  const index = projects.findIndex((project) => project.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  projects[index].view_count = (projects[index].view_count || 0) + 1;
  projects[index].updated_at = new Date().toISOString();
  await writePlaygroundProjects(projects);

  return NextResponse.json(projects[index]);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actorId = getActorId(request.headers);
  const projects = await readPlaygroundProjects();
  const index = projects.findIndex((project) => project.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const current = projects[index];
  if (current.userId !== actorId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  projects[index] = {
    ...current,
    title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : current.title,
    html: typeof body.html === "string" ? body.html : current.html,
    css: typeof body.css === "string" ? body.css : current.css,
    javascript: typeof body.javascript === "string" ? body.javascript : current.javascript,
    cdn_libraries: body.cdn_libraries !== undefined ? normalizeLibraries(body.cdn_libraries) : current.cdn_libraries,
    updated_at: new Date().toISOString()
  };

  await writePlaygroundProjects(projects);
  return NextResponse.json(projects[index]);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actorId = getActorId(request.headers);
  const projects = await readPlaygroundProjects();
  const index = projects.findIndex((project) => project.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (projects[index].userId !== actorId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  projects.splice(index, 1);
  await writePlaygroundProjects(projects);
  return NextResponse.json({ message: "Deleted" });
}
