import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";
import { computeGlobalStreak } from "@/lib/streak";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const streak = await computeGlobalStreak(userId);
  return NextResponse.json({ streak });
}
