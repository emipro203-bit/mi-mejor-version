import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const log = await prisma.waterLog.findUnique({
    where: { userId_date: { userId, date: new Date(date) } },
  });
  return NextResponse.json(log || { cups: 0 });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { date, cups } = await req.json();
  const log = await prisma.waterLog.upsert({
    where: { userId_date: { userId, date: new Date(date) } },
    update: { cups },
    create: { userId, date: new Date(date), cups },
  });
  return NextResponse.json(log);
}
