import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const logs = await prisma.sleepLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const date = new Date(body.date);

  const [bH, bM] = body.bedtime.split(":").map(Number);
  const [wH, wM] = body.wakeTime.split(":").map(Number);
  let bedMins = bH * 60 + bM;
  let wakeMins = wH * 60 + wM;
  if (wakeMins < bedMins) wakeMins += 24 * 60;
  const hours = Math.round(((wakeMins - bedMins) / 60) * 10) / 10;

  const log = await prisma.sleepLog.upsert({
    where: { userId_date: { userId, date } },
    update: { bedtime: body.bedtime, wakeTime: body.wakeTime, hours, quality: body.quality, bodyBattery: body.bodyBattery, stressScore: body.stressScore, notes: body.notes },
    create: { userId, date, bedtime: body.bedtime, wakeTime: body.wakeTime, hours, quality: body.quality || 3, bodyBattery: body.bodyBattery, stressScore: body.stressScore, notes: body.notes },
  });
  return NextResponse.json(log);
}
