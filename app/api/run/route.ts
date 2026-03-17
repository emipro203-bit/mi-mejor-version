import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const sessions = await prisma.runSession.findMany({
    orderBy: { date: "desc" },
    take: 50,
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const session = await prisma.runSession.create({
    data: {
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
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.runSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
