import { NextResponse } from "next/server";
import { getPlaygroundTemplates } from "@/lib/playground-templates";

export async function GET() {
  return NextResponse.json(getPlaygroundTemplates());
}
