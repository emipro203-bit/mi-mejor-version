import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const clientId = process.env.STRAVA_CLIENT_ID!;
  const reqUrl = new URL(req.url);
  const redirectUri = `${reqUrl.protocol}//${reqUrl.host}/api/strava/callback`;

  const url = new URL("https://www.strava.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", "activity:read_all");

  return NextResponse.redirect(url.toString());
}
