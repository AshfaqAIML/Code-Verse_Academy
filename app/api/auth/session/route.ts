import { NextResponse } from "next/server";
import { getAuthTokenFromHeaders, verifyAuthToken } from "@/lib/auth";

export async function GET(request: Request) {
  const token = getAuthTokenFromHeaders(request.headers);
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      name: payload.name,
      email: payload.email,
      role: payload.role
    }
  });
}
