import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const sessions = await prisma.runSession.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 50,
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const session = await prisma.runSession.create({
    data: {
      userId,
      date: new Date(body.date),
      distanceKm: body.distanceKm,
      durationMin: body.durationMin,
      avgHr: body.avgHr,
      zone: body.zone,
      type: body.type || "Easy",
      notes: body.notes,
    },
  });
  return NextResponse.json(session, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.runSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
