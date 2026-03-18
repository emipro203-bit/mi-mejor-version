import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    let where: Record<string, unknown> = { userId };
    if (month) {
      const [y, m] = month.split("-").map(Number);
      where = { userId, date: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) } };
    }
    const events = await prisma.calendarEvent.findMany({ where, orderBy: { date: "asc" } });
    return NextResponse.json(events);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  try {
    const body = await req.json();
    const event = await prisma.calendarEvent.create({
      data: { userId, title: body.title, date: new Date(body.date), color: body.color || "#C9A84C", type: body.type || "event" },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  try {
    const body = await req.json();
    const event = await prisma.calendarEvent.update({
      where: { id: body.id },
      data: { title: body.title, date: new Date(body.date), color: body.color, done: body.done },
    });
    return NextResponse.json(event);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.calendarEvent.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
