import { neon } from "@neondatabase/serverless";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

const sql = neon(process.env.DATABASE_URL!);

async function getValidToken(userId: string) {
  const rows = await sql`
    SELECT "accessToken", "refreshToken", "expiresAt"
    FROM "StravaToken" WHERE "userId" = ${userId}
  `;
  if (rows.length === 0) return null;

  const token = rows[0] as { accessToken: string; refreshToken: string; expiresAt: number };
  const nowSec = Math.floor(Date.now() / 1000);

  // Refresh if expired
  if (token.expiresAt < nowSec + 60) {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    await sql`
      UPDATE "StravaToken"
      SET "accessToken" = ${data.access_token},
          "refreshToken" = ${data.refresh_token},
          "expiresAt" = ${data.expires_at},
          "updatedAt" = NOW()
      WHERE "userId" = ${userId}
    `;
    return data.access_token as string;
  }

  return token.accessToken;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  // Check if connected
  const rows = await sql`SELECT "athleteId" FROM "StravaToken" WHERE "userId" = ${userId}`;
  return NextResponse.json({ connected: rows.length > 0 });
}

export async function POST() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const accessToken = await getValidToken(userId);
  if (!accessToken) {
    return NextResponse.json({ error: "No conectado a Strava" }, { status: 400 });
  }

  // Fetch last 60 runs from Strava
  const res = await fetch(
    "https://www.strava.com/api/v3/athlete/activities?per_page=60&page=1",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Error al obtener actividades de Strava" }, { status: 500 });
  }

  const activities = await res.json();

  // Filter only runs
  const runs = activities.filter((a: { type: string }) => a.type === "Run");

  let imported = 0;
  let skipped = 0;

  for (const run of runs) {
    const date = new Date(run.start_date_local);
    date.setHours(0, 0, 0, 0);

    // Check if already exists for that date
    const existing = await prisma.runSession.findFirst({
      where: { userId, date },
    });

    if (existing) { skipped++; continue; }

    await prisma.runSession.create({
      data: {
        userId,
        date,
        distanceKm: parseFloat((run.distance / 1000).toFixed(2)),
        durationMin: parseFloat((run.moving_time / 60).toFixed(1)),
        avgHr: run.average_heartrate ? Math.round(run.average_heartrate) : null,
        type: run.workout_type === 1 ? "Race" : run.workout_type === 2 ? "Long" : "Easy",
        notes: run.name !== "Morning Run" && run.name !== "Afternoon Run" && run.name !== "Evening Run" ? run.name : null,
      },
    });
    imported++;
  }

  return NextResponse.json({ imported, skipped, total: runs.length });
}

export async function DELETE() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  await sql`DELETE FROM "StravaToken" WHERE "userId" = ${userId}`;
  return NextResponse.json({ ok: true });
}
