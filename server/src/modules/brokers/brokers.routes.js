import { Router } from "express";
import { pool } from "../../config/db.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";
import { Permissions } from "../../constants/permissions.js";
import { ok } from "../../utils/response.js";

const r = Router();
r.use(requireAuth);
r.use(requirePermission(Permissions.PHASE2_VIEW));

r.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM brokers WHERE company_id=? ORDER BY id DESC",
      [req.user.company_id]
    );
    return ok(res, rows, "Brokers");
  } catch (e) { next(e); }
});

r.post("/", async (req, res, next) => {
  try {
    const b = req.body || {};
    const [result] = await pool.query(
      `INSERT INTO brokers (company_id, name, phone, email, commission_type, status)
       VALUES (?,?,?,?,?,?)`,
      [req.user.company_id, b.name, b.phone || null, b.email || null, b.commission_type || "PERCENTAGE", b.status || "ACTIVE"]
    );
    const [rows] = await pool.query("SELECT * FROM brokers WHERE id=? LIMIT 1", [result.insertId]);
    return ok(res, rows?.[0] || null, "Broker created");
  } catch (e) { next(e); }
});

r.put("/:id", async (req, res, next) => {
  try {
    const b = req.body || {};
    const fields = [];
    const vals = [];
    for (const k of ["name", "phone", "email", "commission_type", "status"]) {
      if (k in b) { fields.push(`${k}=?`); vals.push(b[k]); }
    }
    if (fields.length) {
      vals.push(req.params.id, req.user.company_id);
      await pool.query(`UPDATE brokers SET ${fields.join(", ")} WHERE id=? AND company_id=?`, vals);
    }
    const [rows] = await pool.query("SELECT * FROM brokers WHERE id=? AND company_id=? LIMIT 1", [req.params.id, req.user.company_id]);
    return ok(res, rows?.[0] || null, "Broker updated");
  } catch (e) { next(e); }
});

r.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM brokers WHERE id=? AND company_id=?", [req.params.id, req.user.company_id]);
    return ok(res, true, "Broker deleted");
  } catch (e) { next(e); }
});

r.get("/commissions", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT bc.*, b.name AS broker_name, t.trip_code
       FROM broker_commissions bc
       JOIN brokers b ON b.id = bc.broker_id
       LEFT JOIN trips t ON t.id = bc.trip_id
       WHERE bc.company_id=?
       ORDER BY bc.id DESC`,
      [req.user.company_id]
    );
    return ok(res, rows, "Broker commissions");
  } catch (e) { next(e); }
});

r.post("/commissions", async (req, res, next) => {
  try {
    const b = req.body || {};
    const [result] = await pool.query(
      `INSERT INTO broker_commissions
        (company_id, broker_id, trip_id, commission_type, commission_value, commission_amount, status, note)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        req.user.company_id,
        b.broker_id,
        b.trip_id || null,
        b.commission_type || "PERCENTAGE",
        b.commission_value || 0,
        b.commission_amount || 0,
        b.status || "PENDING",
        b.note || null,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM broker_commissions WHERE id=? LIMIT 1", [result.insertId]);
    return ok(res, rows?.[0] || null, "Broker commission created");
  } catch (e) { next(e); }
});

r.put("/commissions/:id", async (req, res, next) => {
  try {
    const b = req.body || {};
    const fields = [];
    const vals = [];
    for (const k of ["broker_id", "trip_id", "commission_type", "commission_value", "commission_amount", "status", "note"]) {
      if (k in b) { fields.push(`${k}=?`); vals.push(b[k]); }
    }
    if (fields.length) {
      vals.push(req.params.id, req.user.company_id);
      await pool.query(`UPDATE broker_commissions SET ${fields.join(", ")} WHERE id=? AND company_id=?`, vals);
    }
    const [rows] = await pool.query("SELECT * FROM broker_commissions WHERE id=? AND company_id=? LIMIT 1", [req.params.id, req.user.company_id]);
    return ok(res, rows?.[0] || null, "Broker commission updated");
  } catch (e) { next(e); }
});

export default r;
