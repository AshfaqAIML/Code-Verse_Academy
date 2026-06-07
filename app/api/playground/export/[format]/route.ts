import { NextResponse } from "next/server";
import JSZip from "jszip";
import { readPlaygroundProjects } from "@/lib/playground-store";

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function getProjectMarkup(project: {
  title: string;
  html: string;
  css: string;
  javascript: string;
  cdn_libraries: { name: string; type: "js" | "css"; url: string }[];
}) {
  const cdnCss = project.cdn_libraries
    .filter((lib) => lib.type === "css")
    .map((lib) => `<link rel="stylesheet" href="${lib.url}">`)
    .join("\n");

  const cdnJs = project.cdn_libraries
    .filter((lib) => lib.type === "js")
    .map((lib) => `<script src="${lib.url}"><\\/script>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.title || "Project")}</title>
  ${cdnCss}
  <style>${project.css || ""}</style>
</head>
<body>
  ${project.html || ""}
  ${cdnJs}
  <script>${project.javascript || ""}<\\/script>
</body>
</html>`;
}

async function resolveProject(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (typeof body.projectId === "string" && body.projectId.trim()) {
    const projects = await readPlaygroundProjects();
    const project = projects.find((item) => item.id === body.projectId);
    if (project) return project;
  }

  return {
    title: typeof body.title === "string" ? body.title : "Project",
    html: typeof body.html === "string" ? body.html : "",
    css: typeof body.css === "string" ? body.css : "",
    javascript: typeof body.javascript === "string" ? body.javascript : "",
    cdn_libraries: Array.isArray(body.cdnLibraries) ? body.cdnLibraries : Array.isArray(body.cdn_libraries) ? body.cdn_libraries : []
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ format: string }> }) {
  const { format } = await params;
  const project = await resolveProject(request);
  const safeTitle = project.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "project";

  if (format === "html") {
    return new Response(getProjectMarkup(project), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeTitle}.html"`
      }
    });
  }

  if (format === "json") {
    const payload = JSON.stringify(
      {
        title: project.title,
        html: project.html,
        css: project.css,
        javascript: project.javascript,
        cdn_libraries: project.cdn_libraries,
        exportedAt: new Date().toISOString()
      },
      null,
      2
    );

    return new Response(payload, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeTitle}.json"`
      }
    });
  }

  if (format === "zip") {
    const zip = new JSZip();
    zip.file("index.html", `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${project.html || ""}
  <script src="script.js"><\\/script>
</body>
</html>`);
    zip.file("style.css", project.css || "");
    zip.file("script.js", project.javascript || "");
    zip.file("README.md", `# ${project.title}\n\nExported from CodeVerse Academy Playground.`);
    const blob = await zip.generateAsync({ type: "nodebuffer" });

    return new Response(new Uint8Array(blob), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeTitle}.zip"`
      }
    });
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}
