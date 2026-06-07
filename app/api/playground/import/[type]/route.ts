import { NextResponse } from "next/server";
import JSZip from "jszip";

type ImportedPayload = {
  html: string;
  css: string;
  javascript: string;
  cdn_libraries: unknown[];
};

function extractHtmlBody(html: string) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

function parseHtmlFile(html: string): ImportedPayload {
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);

  return {
    html: extractHtmlBody(html),
    css: styleMatch?.[1] ?? "",
    javascript: scriptMatch?.[1] ?? "",
    cdn_libraries: []
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (type === "json") {
      const data = JSON.parse(buffer.toString("utf8")) as Partial<ImportedPayload>;
      return NextResponse.json({
        html: typeof data.html === "string" ? data.html : "",
        css: typeof data.css === "string" ? data.css : "",
        javascript: typeof data.javascript === "string" ? data.javascript : "",
        cdn_libraries: Array.isArray(data.cdn_libraries) ? data.cdn_libraries : []
      });
    }

    if (type === "html") {
      return NextResponse.json(parseHtmlFile(buffer.toString("utf8")));
    }

    if (type === "zip") {
      const zip = await JSZip.loadAsync(buffer);
      const htmlFile = zip.file("index.html") || zip.file(/\.html$/i)[0];
      const cssFile = zip.file("style.css") || zip.file(/\.css$/i)[0];
      const jsFile = zip.file("script.js") || zip.file(/\.js$/i)[0];

      const htmlRaw = htmlFile ? await htmlFile.async("string") : "";
      const css = cssFile ? await cssFile.async("string") : "";
      const javascript = jsFile ? await jsFile.async("string") : "";
      const parsed = parseHtmlFile(htmlRaw);

      return NextResponse.json({
        html: parsed.html,
        css: css || parsed.css,
        javascript: javascript || parsed.javascript,
        cdn_libraries: []
      });
    }
  } catch {
    return NextResponse.json({ error: `Invalid ${type.toUpperCase()} file` }, { status: 400 });
  }

  return NextResponse.json({ error: "Unsupported import type" }, { status: 400 });
}
