import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🔧 Running auth migration...");

  // 1. Create User table
  await sql`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT,
      "password" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("✅ User table ready");

  // 2. Add userId to Habit (nullable)
  await sql`ALTER TABLE "Habit" ADD COLUMN IF NOT EXISTS "userId" TEXT`;

  // 3. Add userId to RunSession
  await sql`ALTER TABLE "RunSession" ADD COLUMN IF NOT EXISTS "userId" TEXT`;

  // 4. Add userId to Goal
  await sql`ALTER TABLE "Goal" ADD COLUMN IF NOT EXISTS "userId" TEXT`;

  // 5. Add userId to TradingNote
  await sql`ALTER TABLE "TradingNote" ADD COLUMN IF NOT EXISTS "userId" TEXT`;

  // 6. Add userId to CalendarEvent
  await sql`ALTER TABLE "CalendarEvent" ADD COLUMN IF NOT EXISTS "userId" TEXT`;

  // 7. WaterLog: drop old date unique, add userId + new composite unique
  await sql`ALTER TABLE "WaterLog" ADD COLUMN IF NOT EXISTS "userId" TEXT`;
  await sql`ALTER TABLE "WaterLog" DROP CONSTRAINT IF EXISTS "WaterLog_date_key"`;
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'WaterLog_userId_date_key'
      ) THEN
        ALTER TABLE "WaterLog" ADD CONSTRAINT "WaterLog_userId_date_key" UNIQUE ("userId", "date");
      END IF;
    END $$
  `;

  // 8. SleepLog: drop old date unique, add userId + new composite unique
  await sql`ALTER TABLE "SleepLog" ADD COLUMN IF NOT EXISTS "userId" TEXT`;
  await sql`ALTER TABLE "SleepLog" DROP CONSTRAINT IF EXISTS "SleepLog_date_key"`;
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'SleepLog_userId_date_key'
      ) THEN
        ALTER TABLE "SleepLog" ADD CONSTRAINT "SleepLog_userId_date_key" UNIQUE ("userId", "date");
      END IF;
    END $$
  `;

  // 9. NegocioMetric: drop old date unique, add userId + new composite unique
  await sql`ALTER TABLE "NegocioMetric" ADD COLUMN IF NOT EXISTS "userId" TEXT`;
  await sql`ALTER TABLE "NegocioMetric" DROP CONSTRAINT IF EXISTS "NegocioMetric_date_key"`;
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'NegocioMetric_userId_date_key'
      ) THEN
        ALTER TABLE "NegocioMetric" ADD CONSTRAINT "NegocioMetric_userId_date_key" UNIQUE ("userId", "date");
      END IF;
    END $$
  `;

  // 10. TradingModule: drop old number unique, add userId + new composite unique
  await sql`ALTER TABLE "TradingModule" ADD COLUMN IF NOT EXISTS "userId" TEXT`;
  await sql`ALTER TABLE "TradingModule" DROP CONSTRAINT IF EXISTS "TradingModule_number_key"`;
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TradingModule_userId_number_key'
      ) THEN
        ALTER TABLE "TradingModule" ADD CONSTRAINT "TradingModule_userId_number_key" UNIQUE ("userId", "number");
      END IF;
    END $$
  `;

  console.log("✅ Migration complete! All tables updated with userId support.");
}

migrate().catch(console.error);
