import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const metrics = await prisma.negocioMetric.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json(metrics);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const date = new Date(body.date);

  const metric = await prisma.negocioMetric.upsert({
    where: { userId_date: { userId, date } },
    update: { ventas: body.ventas, pedidos: body.pedidos, igFollowers: body.igFollowers, tiktokFollowers: body.tiktokFollowers, waContacts: body.waContacts },
    create: { userId, date, ventas: body.ventas || 0, pedidos: body.pedidos || 0, igFollowers: body.igFollowers || 0, tiktokFollowers: body.tiktokFollowers || 0, waContacts: body.waContacts || 0 },
  });
  return NextResponse.json(metric);
}
