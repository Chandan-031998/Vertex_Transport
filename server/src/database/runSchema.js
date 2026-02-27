import fs from "fs";
import path from "path";
import { pool } from "../config/db.js";

const schemaPath = path.join(process.cwd(), "src", "database", "schema.sql");
const sql = fs.readFileSync(schemaPath, "utf-8");

async function run() {
  const conn = await pool.getConnection();
  try {
    // Split by ; for simple execution (good enough for this scaffold)
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(Boolean);

    for (const st of statements) {
      try {
        await conn.query(st);
      } catch (e) {
        // Allow re-running schema on existing databases.
        if (e?.code === "ER_DUP_FIELDNAME" || e?.code === "ER_DUP_KEYNAME" || e?.code === "ER_DUP_ENTRY") {
          continue;
        }
        throw e;
      }
    }
    console.log("✅ Database schema applied.");
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error("❌ Failed applying schema:", e.message);
  process.exit(1);
});
