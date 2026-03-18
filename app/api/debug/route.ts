import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    hasDB: !!process.env.DATABASE_URL,
    dbPrefix: process.env.DATABASE_URL?.substring(0, 30) ?? "NOT SET"
  });
}
