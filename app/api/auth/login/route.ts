import { NextResponse } from "next/server";
import { createAuthToken } from "@/lib/auth";
import { getRequestClientKey, rateLimitedResponse, takeRateLimit } from "@/lib/request-rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const ipLimit = takeRateLimit(getRequestClientKey(request, "auth:login"), 20, 5 * 60 * 1000);
  if (!ipLimit.allowed) return rateLimitedResponse(ipLimit.retryAfterSeconds);

  if (email) {
    const emailLimit = takeRateLimit(`auth:login:email:${email}`, 8, 5 * 60 * 1000);
    if (!emailLimit.allowed) return rateLimitedResponse(emailLimit.retryAfterSeconds);
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const configuredAdminEmail = process.env.CODEVERSE_DEMO_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const configuredAdminPassword = process.env.CODEVERSE_DEMO_ADMIN_PASSWORD ?? "";
  const isAdmin = configuredAdminEmail && configuredAdminPassword
    ? email === configuredAdminEmail && password === configuredAdminPassword
    : false;

  const token = createAuthToken({
    email,
    name: isAdmin ? "CodeVerse Admin" : email.split("@")[0],
    role: isAdmin ? "admin" : "student"
  });

  const response = NextResponse.json({
    token,
    user: {
      name: isAdmin ? "CodeVerse Admin" : email.split("@")[0],
      email,
      role: isAdmin ? "admin" : "student"
    }
  });

  response.cookies.set({
    name: "codeverse-token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
