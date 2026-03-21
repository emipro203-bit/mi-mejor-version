import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const reqUrl = new URL(req.url);
  const base = `${reqUrl.protocol}//${reqUrl.host}`;
  const redirectUri = `${base}/api/spotify/callback`;

  const scopes = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: scopes,
    redirect_uri: redirectUri,
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params}`);
}
