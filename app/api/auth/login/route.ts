import { NextResponse } from "next/server";
import { createAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

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

  return NextResponse.json({
    token: createAuthToken({
      email,
      name: isAdmin ? "CodeVerse Admin" : email.split("@")[0],
      role: isAdmin ? "admin" : "student"
    }),
    user: {
      name: isAdmin ? "CodeVerse Admin" : email.split("@")[0],
      email,
      role: isAdmin ? "admin" : "student"
    }
  });
}
