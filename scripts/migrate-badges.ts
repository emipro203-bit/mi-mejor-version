import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🔧 Running badges migration...");

  await sql`
    CREATE TABLE IF NOT EXISTS "UserBadge" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "badge" TEXT NOT NULL,
      "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "UserBadge_userId_badge_key" UNIQUE ("userId", "badge")
    )
  `;

  console.log("✅ UserBadge table ready");
  console.log("✅ Migration complete!");
}

migrate().catch(console.error);
