import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [modules, notes] = await Promise.all([
    prisma.tradingModule.findMany({ orderBy: { number: "asc" } }),
    prisma.tradingNote.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ modules, notes });
}

export async function PATCH(req: Request) {
  const { id, done } = await req.json();
  const mod = await prisma.tradingModule.update({
    where: { id },
    data: { done },
  });
  return NextResponse.json(mod);
}

export async function POST(req: Request) {
  const body = await req.json();
  const note = await prisma.tradingNote.create({
    data: { title: body.title, content: body.content },
  });
  return NextResponse.json(note, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.tradingNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
