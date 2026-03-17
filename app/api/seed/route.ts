import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const habitCount = await prisma.habit.count();
  if (habitCount > 0) {
    return NextResponse.json({ message: "Already seeded" });
  }

  // Seed habits
  await prisma.habit.createMany({
    data: [
      { name: "Entrenamiento", description: "Sesión de ejercicio o running", icon: "🏃" },
      { name: "Meditación", description: "10 minutos de meditación", icon: "🧘" },
      { name: "Revisión de negocios", description: "Revisar métricas del Secreto Perfumista", icon: "💎" },
      { name: "Alimentación limpia", description: "Sin azúcar procesada ni comida chatarra", icon: "🥗" },
      { name: "Hidratación", description: "2,500 ml de agua", icon: "💧" },
      { name: "Lectura", description: "Al menos 20 minutos de lectura", icon: "📚" },
      { name: "Sueño objetivo", description: "Dormir antes de las 11pm, 7-8 horas", icon: "🌙" },
    ],
  });

  // Seed goals
  await prisma.goal.createMany({
    data: [
      {
        name: "Sub-20 5K",
        area: "Running",
        currentValue: 21.57,
        targetValue: 20,
        unit: "minutos",
        deadline: new Date("2025-07-31"),
        notes: "Tiempo actual: 21:34. Entrenamiento base aeróbico + speed work.",
      },
      {
        name: "Ventas Secreto Perfumista",
        area: "Negocio",
        currentValue: 0,
        targetValue: 10000,
        unit: "MXN",
        deadline: new Date("2025-12-31"),
        notes: "Meta mensual promedio: $833 MXN",
      },
    ],
  });

  // Seed trading modules
  await prisma.tradingModule.createMany({
    data: [
      { number: 1, name: "Fundamentos del mercado Forex", done: true },
      { number: 2, name: "Análisis técnico básico", done: true },
      { number: 3, name: "Gestión de riesgo y posición", done: false },
      { number: 4, name: "Estrategias de entrada y salida", done: false },
      { number: 5, name: "Psicología del trading", done: false },
      { number: 6, name: "Backtesting y journaling", done: false },
    ],
  });

  return NextResponse.json({ message: "Seeded successfully" });
}
