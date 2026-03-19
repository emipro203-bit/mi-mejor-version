import { neon } from "@neondatabase/serverless";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";
import { computeGlobalStreak } from "@/lib/streak";
import { BADGE_DEFS } from "@/lib/badges";

const sql = neon(process.env.DATABASE_URL!);

async function awardBadges(userId: string, badges: string[]) {
  for (const badge of badges) {
    await sql`
      INSERT INTO "UserBadge" (id, "userId", badge, "unlockedAt")
      VALUES (gen_random_uuid()::text, ${userId}, ${badge}, NOW())
      ON CONFLICT ("userId", badge) DO NOTHING
    `;
  }
}

async function getUserBadges(userId: string) {
  const rows = await sql`
    SELECT badge, "unlockedAt" FROM "UserBadge" WHERE "userId" = ${userId}
  `;
  return rows as { badge: string; unlockedAt: string }[];
}

async function checkEarned(userId: string): Promise<string[]> {
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
    prisma.tradingModule.findMany({ where: { userId: null }, select: { done: true } }),
    prisma.goal.count({ where: { userId } }),
  ]);

  const streak = await computeGlobalStreak(userId);
  const totalKm = runKm._sum.distanceKm ?? 0;
  const allModulesDone = tradingModules.length > 0 && tradingModules.every(m => m.done);

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

  const earned: string[] = ["early_adopter"];
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

  return earned;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  try {
    const [earned, streak] = await Promise.all([
      checkEarned(userId),
      computeGlobalStreak(userId),
    ]);

    await awardBadges(userId, earned);

    const userBadges = await getUserBadges(userId);
    const unlockedMap: Record<string, string> = {};
    for (const b of userBadges) unlockedMap[b.badge] = b.unlockedAt;

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

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { pomodoroTotal } = await req.json();
  const toAward: string[] = [];
  if (pomodoroTotal >= 10) toAward.push("pomodoro_10");
  if (pomodoroTotal >= 50) toAward.push("pomodoro_50");

  await awardBadges(userId, toAward);
  return NextResponse.json({ ok: true });
}
