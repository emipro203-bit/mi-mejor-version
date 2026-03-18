import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { deadline: "asc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const goal = await prisma.goal.create({
    data: {
      userId,
      name: body.name, area: body.area,
      currentValue: body.currentValue || 0,
      targetValue: body.targetValue,
      unit: body.unit,
      deadline: new Date(body.deadline),
      notes: body.notes,
    },
  });
  return NextResponse.json(goal, { status: 201 });
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const goal = await prisma.goal.update({
    where: { id: body.id },
    data: {
      name: body.name, area: body.area,
      currentValue: body.currentValue,
      targetValue: body.targetValue,
      unit: body.unit,
      deadline: new Date(body.deadline),
      notes: body.notes,
    },
  });
  return NextResponse.json(goal);
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
