import { pool } from "../../config/db.js";
import { ok } from "../../utils/response.js";

function makeRoleCode(name) {
  const base = String(name || "ROLE")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "ROLE";
  return `CUSTOM_${base}_${Date.now()}`;
}

function toRolePayload(row) {
  return {
    id: row.id,
    company_id: row.company_id,
    code: row.code,
    name: row.name,
    description: row.description,
    is_system: !!row.is_system,
    status: row.status,
    permission_codes: row.permission_codes ? row.permission_codes.split(",") : [],
  };
}

async function getRoleByIdForCompany(id, companyId) {
  const [rows] = await pool.query(
    `SELECT r.*, GROUP_CONCAT(p.code ORDER BY p.code) AS permission_codes
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE r.id = ? AND (r.company_id = ? OR r.company_id IS NULL)
     GROUP BY r.id
     LIMIT 1`,
    [id, companyId]
  );
  return rows?.[0] || null;
}

async function replaceRolePermissions(conn, roleId, permissionCodes) {
  await conn.query("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);
  if (!permissionCodes?.length) return;

  const uniq = [...new Set(permissionCodes)];
  await conn.query(
    `INSERT INTO role_permissions (role_id, permission_id)
     SELECT ?, p.id
     FROM permissions p
     WHERE p.code IN (?)`,
    [roleId, uniq]
  );
}

export async function listPermissions(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT id, code, name, module FROM permissions ORDER BY module, code");
    return ok(res, rows, "Permissions");
  } catch (e) {
    next(e);
  }
}

export async function listRoles(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, GROUP_CONCAT(p.code ORDER BY p.code) AS permission_codes
       FROM roles r
       LEFT JOIN role_permissions rp ON rp.role_id = r.id
       LEFT JOIN permissions p ON p.id = rp.permission_id
       WHERE r.company_id = ? OR r.company_id IS NULL
       GROUP BY r.id
       ORDER BY r.is_system DESC, r.name ASC`,
      [req.user.company_id]
    );
    return ok(res, rows.map(toRolePayload), "Roles");
  } catch (e) {
    next(e);
  }
}

export async function getRole(req, res, next) {
  try {
    const row = await getRoleByIdForCompany(req.params.id, req.user.company_id);
    if (!row) return res.status(404).json({ message: "Role not found" });
    return ok(res, toRolePayload(row), "Role");
  } catch (e) {
    next(e);
  }
}

export async function createRole(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const body = req.validated.body;
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO roles (company_id, code, name, description, is_system, status)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [req.user.company_id, makeRoleCode(body.name), body.name, body.description || null, body.status || "ACTIVE"]
    );

    await replaceRolePermissions(conn, result.insertId, body.permission_codes || []);

    await conn.commit();

    const row = await getRoleByIdForCompany(result.insertId, req.user.company_id);
    return ok(res, toRolePayload(row), "Role created");
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
}

export async function updateRole(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const existing = await getRoleByIdForCompany(req.params.id, req.user.company_id);
    if (!existing) return res.status(404).json({ message: "Role not found" });
    if (existing.is_system) return res.status(400).json({ message: "System roles cannot be edited" });

    const body = req.validated.body;
    const fields = [];
    const values = [];

    if ("name" in body) {
      fields.push("name = ?");
      values.push(body.name);
    }
    if ("description" in body) {
      fields.push("description = ?");
      values.push(body.description || null);
    }
    if ("status" in body) {
      fields.push("status = ?");
      values.push(body.status);
    }

    await conn.beginTransaction();

    if (fields.length) {
      values.push(existing.id);
      await conn.query(`UPDATE roles SET ${fields.join(", ")} WHERE id = ?`, values);
    }

    if ("permission_codes" in body) {
      await replaceRolePermissions(conn, existing.id, body.permission_codes || []);
    }

    await conn.commit();

    const row = await getRoleByIdForCompany(existing.id, req.user.company_id);
    return ok(res, toRolePayload(row), "Role updated");
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
}

export async function deleteRole(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const existing = await getRoleByIdForCompany(req.params.id, req.user.company_id);
    if (!existing) return res.status(404).json({ message: "Role not found" });
    if (existing.is_system) return res.status(400).json({ message: "System roles cannot be deleted" });

    const [usedRows] = await conn.query("SELECT COUNT(*) AS cnt FROM users WHERE role_id = ?", [existing.id]);
    if ((usedRows?.[0]?.cnt || 0) > 0) {
      return res.status(400).json({ message: "Role is assigned to users" });
    }

    await conn.query("DELETE FROM roles WHERE id = ?", [existing.id]);
    return ok(res, true, "Role deleted");
  } catch (e) {
    next(e);
  } finally {
    conn.release();
  }
}
