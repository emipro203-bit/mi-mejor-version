import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: Request) {
  const userId = await getUserId();
  const reqUrl = new URL(req.url);
  const base = `${reqUrl.protocol}//${reqUrl.host}`;

  if (!userId) return NextResponse.redirect(`${base}/login`);

  const { searchParams } = reqUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${base}/correr?strava=denied`);
  }

  // Exchange code for tokens
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    return NextResponse.redirect(`${base}/correr?strava=error`);
  }

  const data = await res.json();
  const { access_token, refresh_token, expires_at, athlete } = data;

  // Save tokens
  await sql`
    INSERT INTO "StravaToken" (id, "userId", "accessToken", "refreshToken", "expiresAt", "athleteId", "updatedAt")
    VALUES (gen_random_uuid()::text, ${userId}, ${access_token}, ${refresh_token}, ${expires_at}, ${athlete.id}, NOW())
    ON CONFLICT ("userId") DO UPDATE
      SET "accessToken"  = EXCLUDED."accessToken",
          "refreshToken" = EXCLUDED."refreshToken",
          "expiresAt"    = EXCLUDED."expiresAt",
          "athleteId"    = EXCLUDED."athleteId",
          "updatedAt"    = NOW()
  `;

  return NextResponse.redirect(`${base}/correr?strava=connected`);
}
