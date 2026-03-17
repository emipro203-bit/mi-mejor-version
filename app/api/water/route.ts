import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const log = await prisma.waterLog.findUnique({
    where: { date: new Date(date) },
  });

  return NextResponse.json(log || { cups: 0 });
}

export async function POST(req: Request) {
  const { date, cups } = await req.json();
  const log = await prisma.waterLog.upsert({
    where: { date: new Date(date) },
    update: { cups },
    create: { date: new Date(date), cups },
  });
  return NextResponse.json(log);
}
