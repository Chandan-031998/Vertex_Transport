import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db.js";
import { env } from "../../config/env.js";

async function resolveDriverMapping(user) {
  if (user.role_code !== "DRIVER" || user.driver_id || !user.company_id) return user.driver_id || null;

  const [rows] = await pool.query(
    `SELECT id
     FROM drivers
     WHERE company_id = ?
       AND LOWER(TRIM(name)) = LOWER(TRIM(?))
     ORDER BY id DESC`,
    [user.company_id, user.name || ""]
  );

  // Auto-map only when match is unambiguous.
  if (rows.length !== 1) return null;

  const matchedDriverId = rows[0].id;
  await pool.query("UPDATE users SET driver_id=? WHERE id=?", [matchedDriverId, user.id]);
  return matchedDriverId;
}

async function getPermissionsForRole(roleId) {
  const [rows] = await pool.query(
    `SELECT p.code
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = ?`,
    [roleId]
  );
  return rows.map((r) => r.code);
}

export async function getUserByIdWithPermissions(userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.company_id, u.driver_id, u.name, u.email, u.status,
            r.id AS role_id, r.code AS role_code, r.name AS role_name, r.status AS role_status
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );

  const user = rows?.[0];
  if (!user) return null;
  const driverId = await resolveDriverMapping(user);

  const permissions = await getPermissionsForRole(user.role_id);

  return {
    id: user.id,
    company_id: user.company_id,
    driver_id: driverId,
    name: user.name,
    email: user.email,
    status: user.status,
    role_id: user.role_id,
    role: user.role_code,
    role_name: user.role_name,
    permissions,
  };
}

export async function login(email, password) {
  const [rows] = await pool.query(
    `SELECT u.id, u.company_id, u.driver_id, u.name, u.email, u.password_hash, u.status,
            r.id AS role_id, r.code AS role_code, r.name AS role_name, r.status AS role_status
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = ?
     LIMIT 1`,
    [email]
  );

  const user = rows?.[0];
  if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  if (user.status !== "ACTIVE") throw Object.assign(new Error("Account inactive"), { status: 403 });
  if (user.role_status !== "ACTIVE") throw Object.assign(new Error("Role inactive"), { status: 403 });

  const driverId = await resolveDriverMapping(user);

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

  const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const permissions = await getPermissionsForRole(user.role_id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      company_id: user.company_id,
      driver_id: driverId,
      role_id: user.role_id,
      role: user.role_code,
      role_name: user.role_name,
      permissions,
    },
  };
}
