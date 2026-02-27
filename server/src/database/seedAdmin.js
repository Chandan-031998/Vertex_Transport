import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

async function run() {
  const email = "admin@vertex.local";
  const password = "Admin@123";
  const name = "Vertex Admin";
  const companyName = "Vertex Demo Company";

  // 1) Ensure company exists
  await pool.query(
    "INSERT INTO companies (name) VALUES (?) ON DUPLICATE KEY UPDATE name=VALUES(name)",
    [companyName]
  );

  // 2) Read company id
  const [crows] = await pool.query(
    "SELECT id FROM companies WHERE name=? LIMIT 1",
    [companyName]
  );
  if (!crows || !crows.length) throw new Error("Company not found / not created");

  const companyId = crows[0].id;

  // 3) Ensure ADMIN role exists and fetch id
  const [roleRows] = await pool.query(
    "SELECT id FROM roles WHERE code='ADMIN' LIMIT 1"
  );
  const roleId = roleRows?.[0]?.id;
  if (!roleId) {
    throw new Error("ADMIN role not found. Run `npm run db:init` first.");
  }

  // 4) Hash password
  const hash = await bcrypt.hash(password, 10);

  // 5) Upsert admin user
  await pool.query(
    `INSERT INTO users (company_id, role_id, name, email, password_hash, status)
     VALUES (?,?,?,?,?, 'ACTIVE')
     ON DUPLICATE KEY UPDATE
       company_id=VALUES(company_id),
       role_id=VALUES(role_id),
       name=VALUES(name),
       password_hash=VALUES(password_hash),
       status='ACTIVE'`,
    [companyId, roleId, name, email, hash]
  );

  console.log("✅ Admin ready:");
  console.log("Email:", email);
  console.log("Password:", password);

  await pool.end();
}

run().catch(async (e) => {
  console.error("❌ Seed admin failed:", e);
  try { await pool.end(); } catch {}
  process.exit(1);
});
