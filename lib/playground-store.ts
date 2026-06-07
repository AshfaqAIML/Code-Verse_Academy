import fs from "node:fs/promises";
import path from "node:path";

export type PlaygroundProject = {
  id: string;
  userId: string;
  title: string;
  html: string;
  css: string;
  javascript: string;
  cdn_libraries: { name: string; type: "js" | "css"; url: string }[];
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

const storePath = path.join(process.cwd(), "data", "playground-projects.json");

async function ensureStore() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, "[]", "utf8");
  }
}

export async function readPlaygroundProjects(): Promise<PlaygroundProject[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PlaygroundProject[]) : [];
  } catch {
    return [];
  }
}

export async function writePlaygroundProjects(projects: PlaygroundProject[]) {
  await ensureStore();
  await fs.writeFile(storePath, JSON.stringify(projects, null, 2), "utf8");
}

export function createProjectId() {
  return `pg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeLibraries(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === "object") as PlaygroundProject["cdn_libraries"];
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function serializeProject(project: PlaygroundProject) {
  return {
    ...project,
    cdn_libraries: normalizeLibraries(project.cdn_libraries)
  };
}
