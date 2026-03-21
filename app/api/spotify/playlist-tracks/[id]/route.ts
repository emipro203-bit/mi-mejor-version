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
  await prisma.spotifyToken.update({
    where: { userId },
    data: { accessToken: data.access_token, expiresAt: Math.floor(Date.now() / 1000) + data.expires_in },
  });
  return data.access_token;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { id } = await params;
  const token = await getFreshToken(userId);
  if (!token) return NextResponse.json({ error: "no_token" }, { status: 401 });

  const url = `https://api.spotify.com/v1/playlists/${id}/items?limit=50&market=from_token`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.text();

  if (!res.ok) {
    return NextResponse.json({ error: body, status: res.status }, { status: res.status });
  }

  const data = JSON.parse(body);
  const items = data.items ?? [];
  const tracks = items
    .filter((i: { item?: unknown; track?: unknown }) => i?.item ?? i?.track)
    .map((i: { item?: { id: string; name: string; uri: string; duration_ms: number; artists: { name: string }[]; album: { images: { url: string }[] } }; track?: { id: string; name: string; uri: string; duration_ms: number; artists: { name: string }[]; album: { images: { url: string }[] } } }) => {
      const t = i.item ?? i.track!;
      return {
        id: t.id,
        name: t.name,
        uri: t.uri,
        artist: t.artists.map((a) => a.name).join(", "),
        duration: t.duration_ms,
        image: t.album.images?.[2]?.url ?? t.album.images?.[0]?.url ?? "",
      };
    });

  return NextResponse.json(tracks);
}
