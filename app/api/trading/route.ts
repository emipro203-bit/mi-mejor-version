import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";
import { MODULE_CONTENT } from "@/lib/trading-resources";

async function ensureModules() {
  const existing = await prisma.tradingModule.count({ where: { userId: null } });
  if (existing === 0) {
    await prisma.tradingModule.createMany({
      data: Object.values(MODULE_CONTENT).map(m => ({
        userId: null,
        number: m.number,
        name: m.name,
        done: false,
      })),
    });
  }
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  await ensureModules();

  const [modules, notes] = await Promise.all([
    prisma.tradingModule.findMany({ where: { userId: null }, orderBy: { number: "asc" } }),
    prisma.tradingNote.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ modules, notes });
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { id, done } = await req.json();
  const mod = await prisma.tradingModule.update({ where: { id }, data: { done } });
  return NextResponse.json(mod);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const note = await prisma.tradingNote.create({
    data: { userId, title: body.title, content: body.content },
  });
  return NextResponse.json(note, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.tradingNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
