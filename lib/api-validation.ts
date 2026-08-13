import { NextResponse } from "next/server";

export async function parseAdminBody(
  request: Request
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; error: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 }) };
  }

  return { ok: true, body: body as Record<string, unknown> };
}

export function validateSlug(slug: unknown): string | null {
  if (typeof slug !== "string") return null;
  const normalized = slug.trim();
  if (!normalized || normalized.length > 120 || !/^[a-z0-9-]+$/i.test(normalized)) return null;
  return normalized;
}

export function validateString(value: unknown, maxLength = 10000): boolean {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}