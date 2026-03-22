import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

// Returns Monday of the week containing `date`
function weekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const weekParam = url.searchParams.get("week"); // ISO date string e.g. "2026-03-16"
  const refDate = weekParam ? new Date(weekParam) : new Date();
  const monday = weekStart(refDate);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  const [
    habits,
    habitLogs,
    runs,
    sleepLogs,
    waterLogs,
    goals,
    note,
  ] = await Promise.all([
    prisma.habit.findMany({ where: { userId, active: true }, select: { id: true, name: true, icon: true } }),
    prisma.habitLog.findMany({
      where: { done: true, habit: { userId }, date: { gte: monday, lte: sunday } },
      select: { habitId: true, date: true },
    }),
    prisma.runSession.findMany({
      where: { userId, date: { gte: monday, lte: sunday } },
      select: { distanceKm: true, durationMin: true, date: true },
      orderBy: { date: "asc" },
    }),
    prisma.sleepLog.findMany({
      where: { userId, date: { gte: monday, lte: sunday } },
      select: { hours: true, date: true },
      orderBy: { date: "asc" },
    }),
    prisma.waterLog.findMany({
      where: { userId, date: { gte: monday, lte: sunday } },
      select: { cups: true, date: true },
    }),
    prisma.goal.findMany({
      where: { userId },
      select: { id: true, name: true, area: true, currentValue: true, targetValue: true, unit: true },
    }),
    prisma.weeklyNote.findUnique({
      where: { userId_weekStart: { userId, weekStart: monday } },
      select: { note: true },
    }),
  ]);

  // Hábitos
  const totalHabitSlots = habits.length * 7;
  const completedHabits = habitLogs.length;
  const habitRate = totalHabitSlots > 0 ? Math.round((completedHabits / totalHabitSlots) * 100) : 0;

  // Per-habit breakdown
  const habitBreakdown = habits.map(h => ({
    ...h,
    daysCompleted: habitLogs.filter(l => l.habitId === h.id).length,
  }));

  // Running
  const runKm = runs.reduce((s, r) => s + r.distanceKm, 0);
  const runSessions = runs.length;

  // Sleep
  const avgSleep = sleepLogs.length > 0
    ? sleepLogs.reduce((s, l) => s + l.hours, 0) / sleepLogs.length
    : null;
  const sleepNights = sleepLogs.length;

  // Water
  const waterFullDays = waterLogs.filter(w => w.cups >= 10).length;

  // Goals
  const goalsWithPct = goals.map(g => ({
    ...g,
    pct: g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0,
  }));

  return NextResponse.json({
    weekStart: monday.toISOString().split("T")[0],
    weekEnd: sunday.toISOString().split("T")[0],
    habits: {
      completed: completedHabits,
      total: totalHabitSlots,
      rate: habitRate,
      breakdown: habitBreakdown,
    },
    running: {
      sessions: runSessions,
      km: Math.round(runKm * 10) / 10,
      runs,
    },
    sleep: {
      nights: sleepNights,
      avgHours: avgSleep !== null ? Math.round(avgSleep * 10) / 10 : null,
      logs: sleepLogs,
    },
    water: {
      fullDays: waterFullDays,
    },
    goals: goalsWithPct,
    note: note?.note ?? "",
  });
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { weekStart: ws, note } = await req.json();
  const monday = new Date(ws);
  monday.setUTCHours(0, 0, 0, 0);

  await prisma.weeklyNote.upsert({
    where: { userId_weekStart: { userId, weekStart: monday } },
    update: { note },
    create: { userId, weekStart: monday, note },
  });

  return NextResponse.json({ ok: true });
}
