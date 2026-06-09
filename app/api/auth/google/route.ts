import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { createAuthToken } from "@/lib/auth";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split("@")[0];

    const token = createAuthToken({ email, name, role: "student" });

    const response = NextResponse.json({
      token,
      user: { name, email, role: "student" },
    });

    response.cookies.set({
      name: "codeverse-token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("Google auth error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}
