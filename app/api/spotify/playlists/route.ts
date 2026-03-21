import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

async function getFreshToken(userId: string): Promise<string | null> {
  const stored = await prisma.spotifyToken.findUnique({ where: { userId } });
  if (!stored) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  if (stored.expiresAt > nowSec + 60) return stored.accessToken;

  const creds = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Authorization": `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: stored.refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
  await prisma.spotifyToken.update({
    where: { userId },
    data: { accessToken: data.access_token, expiresAt, ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}) },
  });
  return data.access_token;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const token = await getFreshToken(userId);
  if (!token) return NextResponse.json({ error: "no_token" }, { status: 401 });

  const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.text();
  if (!res.ok) {
    console.error("Spotify playlists error:", res.status, body);
    return NextResponse.json({ error: body, status: res.status }, { status: res.status });
  }

  const data = JSON.parse(body);
  return NextResponse.json(data.items ?? []);
}
