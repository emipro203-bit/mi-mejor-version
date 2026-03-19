import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🔧 Running Strava migration...");

  await sql`
    CREATE TABLE IF NOT EXISTS "StravaToken" (
      "id"           TEXT NOT NULL PRIMARY KEY,
      "userId"       TEXT NOT NULL UNIQUE,
      "accessToken"  TEXT NOT NULL,
      "refreshToken" TEXT NOT NULL,
      "expiresAt"    BIGINT NOT NULL,
      "athleteId"    BIGINT NOT NULL,
      "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log("✅ StravaToken table ready");
  console.log("✅ Migration complete!");
}

migrate().catch(console.error);
