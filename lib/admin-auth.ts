import { NextResponse } from "next/server";
import { verifyAuthToken, getAuthTokenFromRequest } from "@/lib/auth";

export function requireAdmin(request: Request) {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = verifyAuthToken(token);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
