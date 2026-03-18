import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";
import { computeGlobalStreak } from "@/lib/streak";
import { BADGE_DEFS } from "@/lib/badges";

async function checkAndAward(userId: string) {
  const [
    habitLogCount,
    habitLogs,
    habits,
    runCount,
    runKm,
    waterFull,
    sleepCount,
    tradingModules,
    goalCount,
  ] = await Promise.all([
    prisma.habitLog.count({ where: { done: true, habit: { userId } } }),
    prisma.habitLog.findMany({
      where: { done: true, habit: { userId } },
      select: { date: true, habitId: true },
    }),
    prisma.habit.findMany({ where: { userId }, select: { id: true } }),
    prisma.runSession.count({ where: { userId } }),
    prisma.runSession.aggregate({ where: { userId }, _sum: { distanceKm: true } }),
    prisma.waterLog.count({ where: { userId, cups: { gte: 10 } } }),
    prisma.sleepLog.count({ where: { userId } }),
    prisma.tradingModule.findMany({ where: { userId }, select: { done: true } }),
    prisma.goal.count({ where: { userId } }),
  ]);

  const streak = await computeGlobalStreak(userId);
  const totalKm = runKm._sum.distanceKm ?? 0;
  const allModulesDone = tradingModules.length > 0 && tradingModules.every(m => m.done);

  // Check perfect day: any day where all habits were completed
  const habitIds = habits.map(h => h.id);
  let perfectDay = false;
  if (habitIds.length > 0) {
    const byDate: Record<string, Set<string>> = {};
    for (const l of habitLogs) {
      const ds = l.date.toISOString().split("T")[0];
      if (!byDate[ds]) byDate[ds] = new Set();
      byDate[ds].add(l.habitId);
    }
    perfectDay = Object.values(byDate).some(s => habitIds.every(id => s.has(id)));
  }

  const earned: string[] = [];
  if (true) earned.push("early_adopter");
  if (habitLogCount >= 1) earned.push("habit_first");
  if (perfectDay) earned.push("habit_perfect_day");
  if (streak >= 3) earned.push("streak_3");
  if (streak >= 7) earned.push("streak_7");
  if (streak >= 30) earned.push("streak_30");
  if (runCount >= 1) earned.push("run_first");
  if (runCount >= 10) earned.push("run_10");
  if (totalKm >= 100) earned.push("run_100km");
  if (waterFull >= 7) earned.push("water_7");
  if (sleepCount >= 7) earned.push("sleep_7");
  if (allModulesDone) earned.push("trading_complete");
  if (goalCount >= 1) earned.push("goal_first");

  // Award new badges (ignore duplicates due to unique constraint)
  await Promise.all(
    earned.map(badge =>
      prisma.userBadge.upsert({
        where: { userId_badge: { userId, badge } },
        update: {},
        create: { userId, badge },
      }).catch(() => null)
    )
  );

  return earned;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  try {
    // Must await checkAndAward BEFORE reading badges, otherwise the read
    // runs before the inserts complete (race condition).
    const earned = await checkAndAward(userId);

    const [allBadges, streak] = await Promise.all([
      prisma.userBadge.findMany({ where: { userId } }),
      computeGlobalStreak(userId),
    ]);

    const unlockedMap: Record<string, string> = {};
    for (const b of allBadges) unlockedMap[b.badge] = b.unlockedAt.toISOString();

    const badges = BADGE_DEFS.map(def => ({
      ...def,
      unlocked: !!unlockedMap[def.id],
      unlockedAt: unlockedMap[def.id] ?? null,
    }));

    return NextResponse.json({ badges, streak, newlyEarned: earned });
  } catch (e) {
    console.error("Badges error:", e);
    return NextResponse.json({ badges: BADGE_DEFS.map(d => ({ ...d, unlocked: false, unlockedAt: null })), streak: 0, newlyEarned: [] });
  }
}

// POST: award pomodoro badges from client-side count
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { pomodoroTotal } = await req.json();
  const toAward: string[] = [];
  if (pomodoroTotal >= 10) toAward.push("pomodoro_10");
  if (pomodoroTotal >= 50) toAward.push("pomodoro_50");

  await Promise.all(
    toAward.map(badge =>
      prisma.userBadge.upsert({
        where: { userId_badge: { userId, badge } },
        update: {},
        create: { userId, badge },
      }).catch(() => null)
    )
  );

  return NextResponse.json({ ok: true });
}
