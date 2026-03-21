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
    "playlist-read-private",
    "playlist-read-collaborative",
  ].join(" ");

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "SPOTIFY_CLIENT_ID no está configurado en las variables de entorno de Vercel" }, { status: 500 });
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    show_dialog: "true",
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params}`);
}
