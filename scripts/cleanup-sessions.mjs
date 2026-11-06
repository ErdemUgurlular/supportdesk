import nextEnv from "@next/env";
import { Pool } from "pg";

// Extract the CommonJS export
const { loadEnvConfig } = nextEnv;

// Load .env.local from the project root
loadEnvConfig(process.cwd());

// Validate environment configuration
const requiredVariables = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`${variable} is missing.`);
  }
}

// Create PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function cleanupSessions() {
  try {
    const result = await pool.query(`
      DELETE FROM public.user_sessions
      WHERE expires_at <= CURRENT_TIMESTAMP
         OR absolute_expires_at <= CURRENT_TIMESTAMP
         OR revoked_at <= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `);

    console.log(
      `Session cleanup completed. Deleted ${result.rowCount} sessions.`,
    );
  } catch (error) {
    console.error("Session cleanup failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

cleanupSessions();
