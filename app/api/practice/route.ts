import { NextResponse } from "next/server";

const demoProgress = {
  streak: 21,
  xp: 7640,
  submissions: 128,
  reviewQueue: 6,
  dailyChallenge: ["10 MCQs", "1 coding lab", "1 interview answer"],
  weakTopics: ["Async JavaScript", "SQL joins", "FastAPI dependency injection"]
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    progress: demoProgress
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    ok: true,
    message: "Practice submission saved for mentor review.",
    submission: {
      id: `practice-${Date.now()}`,
      trackId: body.trackId ?? "demo-track",
      taskId: body.taskId ?? "demo-task",
      status: "submitted",
      createdAt: new Date().toISOString()
    }
  });
}
