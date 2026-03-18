import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { habitId, date, done } = await req.json();
  const dateObj = new Date(date);

  await prisma.habitLog.upsert({
    where: { habitId_date: { habitId, date: dateObj } },
    update: { done },
    create: { habitId, date: dateObj, done },
  });

  const logs = await prisma.habitLog.findMany({
    where: { habitId, done: true },
    orderBy: { date: "desc" },
  });

  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const l of logs) {
    const logDate = new Date(l.date);
    logDate.setHours(0, 0, 0, 0);
    const diff = Math.round((current.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 1) { streak++; current = logDate; } else break;
  }

  await prisma.habit.update({ where: { id: habitId }, data: { streak } });
  return NextResponse.json({ ok: true, streak });
}
