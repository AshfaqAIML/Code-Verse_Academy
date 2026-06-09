import { NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { updateStreak, getStreak } from "@/lib/models/Streak";

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = await getStreak(user.email);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = await updateStreak(user.email);
  return NextResponse.json({
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
  });
}
