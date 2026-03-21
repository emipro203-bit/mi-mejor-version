import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const base = `${reqUrl.protocol}//${reqUrl.host}`;

  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.redirect(`${base}/login`);

    const code = reqUrl.searchParams.get("code");
    const error = reqUrl.searchParams.get("error");

    if (error || !code) {
      return NextResponse.redirect(`${base}/hoy?spotify=denied&reason=${error ?? "no_code"}`);
    }

    const redirectUri = `${base}/api/spotify/callback`;
    const creds = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const body = await res.text();

    if (!res.ok) {
      console.error("Spotify token error:", res.status, body);
      return NextResponse.redirect(`${base}/hoy?spotify=error&msg=${encodeURIComponent(body.slice(0, 200))}`);
    }

    const data = JSON.parse(body);
    const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;

    await prisma.spotifyToken.upsert({
      where: { userId },
      update: { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt },
      create: { userId, accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt },
    });

    return NextResponse.redirect(`${base}/hoy?spotify=connected`);
  } catch (e) {
    console.error("Spotify callback exception:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.redirect(`${base}/hoy?spotify=exception&msg=${encodeURIComponent(msg.slice(0, 200))}`);
  }
}
