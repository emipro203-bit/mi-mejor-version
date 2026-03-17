import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const habits = await prisma.habit.findMany({
    where: { active: true },
    include: {
      logs: {
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(habits);
}

export async function POST(req: Request) {
  const body = await req.json();
  const habit = await prisma.habit.create({
    data: {
      name: body.name,
      description: body.description,
      icon: body.icon,
    },
  });
  return NextResponse.json(habit, { status: 201 });
}
