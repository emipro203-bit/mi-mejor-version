import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function setupDB() {
  console.log("🔧 Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS "Habit" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "icon" TEXT,
      "streak" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "HabitLog" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "habitId" TEXT NOT NULL,
      "date" DATE NOT NULL,
      "done" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE ("habitId", "date"),
      FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "WaterLog" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "date" DATE NOT NULL UNIQUE,
      "cups" INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "NegocioMetric" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "date" DATE NOT NULL UNIQUE,
      "ventas" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "pedidos" INTEGER NOT NULL DEFAULT 0,
      "igFollowers" INTEGER NOT NULL DEFAULT 0,
      "tiktokFollowers" INTEGER NOT NULL DEFAULT 0,
      "waContacts" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "RunSession" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "date" DATE NOT NULL,
      "distanceKm" DOUBLE PRECISION NOT NULL,
      "durationMin" DOUBLE PRECISION NOT NULL,
      "avgHr" INTEGER,
      "zone" TEXT,
      "type" TEXT NOT NULL DEFAULT 'Easy',
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "SleepLog" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "date" DATE NOT NULL UNIQUE,
      "bedtime" TEXT NOT NULL,
      "wakeTime" TEXT NOT NULL,
      "hours" DOUBLE PRECISION NOT NULL,
      "quality" INTEGER NOT NULL DEFAULT 3,
      "bodyBattery" INTEGER,
      "stressScore" INTEGER,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Goal" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "area" TEXT NOT NULL,
      "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "targetValue" DOUBLE PRECISION NOT NULL,
      "unit" TEXT NOT NULL,
      "deadline" TIMESTAMP(3) NOT NULL,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "TradingModule" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "number" INTEGER NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "done" BOOLEAN NOT NULL DEFAULT false
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "TradingNote" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log("✅ Tables created!");

  // Seed
  const habits = await sql`SELECT COUNT(*) FROM "Habit"`;
  if (parseInt(habits[0].count) > 0) {
    console.log("⏭️  Already seeded, skipping.");
    return;
  }

  console.log("🌱 Seeding...");

  const { randomUUID } = await import("crypto");

  const habitData = [
    { name: "Entrenamiento", description: "Sesión de ejercicio o running", icon: "🏃" },
    { name: "Meditación", description: "10 minutos de meditación", icon: "🧘" },
    { name: "Revisión de negocios", description: "Revisar métricas del Secreto Perfumista", icon: "💎" },
    { name: "Alimentación limpia", description: "Sin azúcar procesada ni comida chatarra", icon: "🥗" },
    { name: "Hidratación", description: "2,500 ml de agua", icon: "💧" },
    { name: "Lectura", description: "Al menos 20 minutos de lectura", icon: "📚" },
    { name: "Sueño objetivo", description: "Dormir antes de las 11pm, 7-8 horas", icon: "🌙" },
  ];

  for (const h of habitData) {
    await sql`
      INSERT INTO "Habit" ("id","name","description","icon","streak","active","createdAt","updatedAt")
      VALUES (${randomUUID()}, ${h.name}, ${h.description}, ${h.icon}, 0, true, NOW(), NOW())
    `;
  }

  await sql`
    INSERT INTO "Goal" ("id","name","area","currentValue","targetValue","unit","deadline","notes","createdAt","updatedAt")
    VALUES
      (${randomUUID()}, 'Sub-20 5K', 'Running', 21.57, 20, 'minutos', '2025-07-31', 'Tiempo actual: 21:34', NOW(), NOW()),
      (${randomUUID()}, 'Ventas Secreto Perfumista', 'Negocio', 0, 10000, 'MXN', '2025-12-31', 'Meta mensual: $833 MXN', NOW(), NOW())
  `;

  const modules = [
    { n: 1, name: "Fundamentos del mercado Forex", done: true },
    { n: 2, name: "Análisis técnico básico", done: true },
    { n: 3, name: "Gestión de riesgo y posición", done: false },
    { n: 4, name: "Estrategias de entrada y salida", done: false },
    { n: 5, name: "Psicología del trading", done: false },
    { n: 6, name: "Backtesting y journaling", done: false },
  ];

  for (const m of modules) {
    await sql`
      INSERT INTO "TradingModule" ("id","number","name","done")
      VALUES (${randomUUID()}, ${m.n}, ${m.name}, ${m.done})
    `;
  }

  console.log("✅ Seed complete!");
}

setupDB().catch(console.error);
