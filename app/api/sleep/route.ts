import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const logs = await prisma.sleepLog.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const date = new Date(body.date);

  // Calculate hours from bedtime and wakeTime
  const [bH, bM] = body.bedtime.split(":").map(Number);
  const [wH, wM] = body.wakeTime.split(":").map(Number);
  let bedMins = bH * 60 + bM;
  let wakeMins = wH * 60 + wM;
  if (wakeMins < bedMins) wakeMins += 24 * 60; // next day
  const hours = Math.round(((wakeMins - bedMins) / 60) * 10) / 10;

  const log = await prisma.sleepLog.upsert({
    where: { date },
    update: {
      bedtime: body.bedtime,
      wakeTime: body.wakeTime,
      hours,
      quality: body.quality,
      bodyBattery: body.bodyBattery,
      stressScore: body.stressScore,
      notes: body.notes,
    },
    create: {
      date,
      bedtime: body.bedtime,
      wakeTime: body.wakeTime,
      hours,
      quality: body.quality || 3,
      bodyBattery: body.bodyBattery,
      stressScore: body.stressScore,
      notes: body.notes,
    },
  });

  return NextResponse.json(log);
}
