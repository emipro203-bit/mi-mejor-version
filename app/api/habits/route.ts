import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const habits = await prisma.habit.findMany({
    where: { userId, active: true },
    include: {
      logs: {
        where: { date: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(habits);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const habit = await prisma.habit.create({
    data: { userId, name: body.name, description: body.description, icon: body.icon || "⚡" },
  });
  return NextResponse.json(habit, { status: 201 });
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const habit = await prisma.habit.update({
    where: { id: body.id },
    data: { name: body.name, description: body.description, icon: body.icon },
  });
  return NextResponse.json(habit);
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.habit.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
