import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const metrics = await prisma.negocioMetric.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json(metrics);
}

export async function POST(req: Request) {
  const body = await req.json();
  const date = new Date(body.date);

  const metric = await prisma.negocioMetric.upsert({
    where: { date },
    update: {
      ventas: body.ventas,
      pedidos: body.pedidos,
      igFollowers: body.igFollowers,
      tiktokFollowers: body.tiktokFollowers,
      waContacts: body.waContacts,
    },
    create: {
      date,
      ventas: body.ventas || 0,
      pedidos: body.pedidos || 0,
      igFollowers: body.igFollowers || 0,
      tiktokFollowers: body.tiktokFollowers || 0,
      waContacts: body.waContacts || 0,
    },
  });

  return NextResponse.json(metric);
}
