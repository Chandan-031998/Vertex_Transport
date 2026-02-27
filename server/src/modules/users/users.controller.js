import bcrypt from "bcryptjs";
import { pool } from "../../config/db.js";
import { ok } from "../../utils/response.js";
import { writeAuditLog } from "../../utils/audit.js";

async function getRoleForCompany(roleId, companyId) {
  const [rows] = await pool.query(
    "SELECT id, company_id, code, name, is_system, status FROM roles WHERE id = ? AND (company_id = ? OR company_id IS NULL) LIMIT 1",
    [roleId, companyId]
  );
  return rows?.[0] || null;
}

async function getDriverForCompany(driverId, companyId) {
  if (!driverId) return null;
  const [rows] = await pool.query(
    "SELECT id, company_id, name FROM drivers WHERE id = ? AND company_id = ? LIMIT 1",
    [driverId, companyId]
  );
  return rows?.[0] || null;
}

async function getUserForCompany(id, companyId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.company_id, u.driver_id, d.name AS driver_name, u.name, u.email, u.status, u.created_at,
            r.id AS role_id, r.code AS role, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN drivers d ON d.id = u.driver_id
     WHERE u.id = ? AND u.company_id = ?
     LIMIT 1`,
    [id, companyId]
  );
  return rows?.[0] || null;
}

export async function listUsers(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.company_id, u.driver_id, d.name AS driver_name, u.name, u.email, u.status, u.created_at,
              r.id AS role_id, r.code AS role, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN drivers d ON d.id = u.driver_id
       WHERE u.company_id = ?
       ORDER BY u.id DESC`,
      [req.user.company_id]
    );
    return ok(res, rows, "Users");
  } catch (e) {
    next(e);
  }
}

export async function getUser(req, res, next) {
  try {
    const row = await getUserForCompany(req.params.id, req.user.company_id);
    if (!row) return res.status(404).json({ message: "User not found" });
    return ok(res, row, "User");
  } catch (e) {
    next(e);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, role_id, driver_id, password, status } = req.validated.body;

    const role = await getRoleForCompany(role_id, req.user.company_id);
    if (!role) return res.status(400).json({ message: "Invalid role" });
    if (role.status !== "ACTIVE") return res.status(400).json({ message: "Role is inactive" });
    const mappedDriverId = role.code === "DRIVER" ? driver_id : null;
    if (role.code === "DRIVER" && !mappedDriverId) {
      return res.status(400).json({ message: "Driver profile is required for DRIVER role" });
    }
    if (mappedDriverId) {
      const driver = await getDriverForCompany(mappedDriverId, req.user.company_id);
      if (!driver) return res.status(400).json({ message: "Invalid driver profile" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (company_id, role_id, driver_id, name, email, password_hash, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.company_id, role_id, mappedDriverId, name, email.toLowerCase(), hash, status || "ACTIVE"]
    );

    const row = await getUserForCompany(result.insertId, req.user.company_id);
    await writeAuditLog({
      company_id: req.user.company_id,
      actor_user_id: req.user.id,
      action: "USER_CREATE",
      module: "users",
      entity: "users",
      entity_id: String(result.insertId),
      meta: { email: row?.email, role_id, driver_id: mappedDriverId || null },
      ip: req.ip,
      user_agent: req.headers["user-agent"] || null,
    });
    return ok(res, row, "User created");
  } catch (e) {
    if (String(e.message || "").includes("Duplicate entry")) {
      return res.status(400).json({ message: "Email already exists" });
    }
    next(e);
  }
}

export async function updateUser(req, res, next) {
  try {
    const existing = await getUserForCompany(req.params.id, req.user.company_id);
    if (!existing) return res.status(404).json({ message: "User not found" });

    const body = req.validated.body;
    const nextRoleId = "role_id" in body ? body.role_id : existing.role_id;
    const nextRole = await getRoleForCompany(nextRoleId, req.user.company_id);
    if (!nextRole) return res.status(400).json({ message: "Invalid role" });
    if (nextRole.status !== "ACTIVE") return res.status(400).json({ message: "Role is inactive" });

    const explicitDriverId = "driver_id" in body ? body.driver_id : existing.driver_id;
    const mappedDriverId = nextRole.code === "DRIVER" ? explicitDriverId : null;
    if (nextRole.code === "DRIVER" && !mappedDriverId) {
      return res.status(400).json({ message: "Driver profile is required for DRIVER role" });
    }
    if (mappedDriverId) {
      const driver = await getDriverForCompany(mappedDriverId, req.user.company_id);
      if (!driver) return res.status(400).json({ message: "Invalid driver profile" });
    }

    if (body.role_id) {
      const role = await getRoleForCompany(body.role_id, req.user.company_id);
      if (!role) return res.status(400).json({ message: "Invalid role" });
      if (role.status !== "ACTIVE") return res.status(400).json({ message: "Role is inactive" });
    }

    const fields = [];
    const values = [];

    if ("name" in body) {
      fields.push("name = ?");
      values.push(body.name);
    }
    if ("email" in body) {
      fields.push("email = ?");
      values.push(body.email.toLowerCase());
    }
    if ("role_id" in body) {
      fields.push("role_id = ?");
      values.push(body.role_id);
    }
    if ("driver_id" in body || ("role_id" in body && nextRole.code !== "DRIVER")) {
      fields.push("driver_id = ?");
      values.push(mappedDriverId || null);
    }
    if ("status" in body) {
      fields.push("status = ?");
      values.push(body.status);
    }

    if (!fields.length) return ok(res, existing, "User updated");

    values.push(existing.id, req.user.company_id);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ? AND company_id = ?`, values);

    const row = await getUserForCompany(existing.id, req.user.company_id);
    await writeAuditLog({
      company_id: req.user.company_id,
      actor_user_id: req.user.id,
      action: "USER_UPDATE",
      module: "users",
      entity: "users",
      entity_id: String(existing.id),
      meta: body,
      ip: req.ip,
      user_agent: req.headers["user-agent"] || null,
    });
    return ok(res, row, "User updated");
  } catch (e) {
    if (String(e.message || "").includes("Duplicate entry")) {
      return res.status(400).json({ message: "Email already exists" });
    }
    next(e);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const existing = await getUserForCompany(req.params.id, req.user.company_id);
    if (!existing) return res.status(404).json({ message: "User not found" });

    const hash = await bcrypt.hash(req.validated.body.password, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ? AND company_id = ?", [
      hash,
      existing.id,
      req.user.company_id,
    ]);
    await writeAuditLog({
      company_id: req.user.company_id,
      actor_user_id: req.user.id,
      action: "USER_PASSWORD_RESET",
      module: "users",
      entity: "users",
      entity_id: String(existing.id),
      ip: req.ip,
      user_agent: req.headers["user-agent"] || null,
    });

    return ok(res, true, "Password reset");
  } catch (e) {
    next(e);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const existing = await getUserForCompany(req.params.id, req.user.company_id);
    if (!existing) return res.status(404).json({ message: "User not found" });
    if (Number(existing.id) === Number(req.user.id)) {
      return res.status(400).json({ message: "You cannot delete your own user" });
    }

    await pool.query("DELETE FROM users WHERE id = ? AND company_id = ?", [existing.id, req.user.company_id]);
    await writeAuditLog({
      company_id: req.user.company_id,
      actor_user_id: req.user.id,
      action: "USER_DELETE",
      module: "users",
      entity: "users",
      entity_id: String(existing.id),
      meta: { email: existing.email },
      ip: req.ip,
      user_agent: req.headers["user-agent"] || null,
    });
    return ok(res, true, "User deleted");
  } catch (e) {
    next(e);
  }
}

export async function listLoginActivity(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT al.id, al.action, al.entity_id, al.meta_json, al.ip, al.user_agent, al.created_at,
              u.email AS actor_email
       FROM admin_audit_logs al
       LEFT JOIN users u ON u.id = al.actor_user_id
       WHERE al.company_id = ?
         AND al.module = 'auth'
         AND al.action = 'LOGIN_SUCCESS'
       ORDER BY al.id DESC
       LIMIT 200`,
      [req.user.company_id]
    );
    return ok(res, rows, "Login activity");
  } catch (e) {
    next(e);
  }
}

export async function listAuditLogs(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT al.id, al.action, al.module, al.entity, al.entity_id, al.meta_json, al.ip, al.created_at,
              u.email AS actor_email
       FROM admin_audit_logs al
       LEFT JOIN users u ON u.id = al.actor_user_id
       WHERE al.company_id = ?
       ORDER BY al.id DESC
       LIMIT 300`,
      [req.user.company_id]
    );
    return ok(res, rows, "Audit logs");
  } catch (e) {
    next(e);
  }
}
