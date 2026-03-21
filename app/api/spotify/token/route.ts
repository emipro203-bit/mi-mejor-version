import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const stored = await prisma.spotifyToken.findUnique({ where: { userId } });
  if (!stored) return NextResponse.json({ token: null });

  const nowSec = Math.floor(Date.now() / 1000);

  // Return existing token if still valid (with 60s buffer)
  if (stored.expiresAt > nowSec + 60) {
    return NextResponse.json({ token: stored.accessToken });
  }

  // Refresh
  const creds = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: stored.refreshToken,
    }),
  });

  if (!res.ok) return NextResponse.json({ token: null });

  const data = await res.json();
  const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;

  await prisma.spotifyToken.update({
    where: { userId },
    data: {
      accessToken: data.access_token,
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      expiresAt,
    },
  });

  return NextResponse.json({ token: data.access_token });
}
