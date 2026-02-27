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
      "SELECT * FROM vendors WHERE company_id=? ORDER BY id DESC",
      [req.user.company_id]
    );
    return ok(res, rows, "Vendors");
  } catch (e) { next(e); }
});

r.post("/", async (req, res, next) => {
  try {
    const b = req.body || {};
    const [result] = await pool.query(
      `INSERT INTO vendors (company_id, name, contact_person, phone, email, gst_no, address, status)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        req.user.company_id,
        b.name,
        b.contact_person || null,
        b.phone || null,
        b.email || null,
        b.gst_no || null,
        b.address || null,
        b.status || "ACTIVE",
      ]
    );
    const [rows] = await pool.query("SELECT * FROM vendors WHERE id=? LIMIT 1", [result.insertId]);
    return ok(res, rows?.[0] || null, "Vendor created");
  } catch (e) { next(e); }
});

r.put("/:id", async (req, res, next) => {
  try {
    const b = req.body || {};
    const fields = [];
    const vals = [];
    for (const k of ["name", "contact_person", "phone", "email", "gst_no", "address", "status"]) {
      if (k in b) { fields.push(`${k}=?`); vals.push(b[k]); }
    }
    if (fields.length) {
      vals.push(req.params.id, req.user.company_id);
      await pool.query(`UPDATE vendors SET ${fields.join(", ")} WHERE id=? AND company_id=?`, vals);
    }
    const [rows] = await pool.query("SELECT * FROM vendors WHERE id=? AND company_id=? LIMIT 1", [req.params.id, req.user.company_id]);
    return ok(res, rows?.[0] || null, "Vendor updated");
  } catch (e) { next(e); }
});

r.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM vendors WHERE id=? AND company_id=?", [req.params.id, req.user.company_id]);
    return ok(res, true, "Vendor deleted");
  } catch (e) { next(e); }
});

r.get("/vehicles", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT vv.*, v.name AS vendor_name
       FROM vendor_vehicles vv
       JOIN vendors v ON v.id = vv.vendor_id
       WHERE v.company_id=?
       ORDER BY vv.id DESC`,
      [req.user.company_id]
    );
    return ok(res, rows, "Vendor vehicles");
  } catch (e) { next(e); }
});

r.post("/vehicles", async (req, res, next) => {
  try {
    const b = req.body || {};
    const [vrows] = await pool.query("SELECT id FROM vendors WHERE id=? AND company_id=? LIMIT 1", [b.vendor_id, req.user.company_id]);
    if (!vrows?.[0]) return res.status(400).json({ message: "Invalid vendor" });

    const [result] = await pool.query(
      `INSERT INTO vendor_vehicles (vendor_id, vehicle_no, vehicle_type, capacity_tons, status)
       VALUES (?,?,?,?,?)`,
      [b.vendor_id, b.vehicle_no, b.vehicle_type || null, b.capacity_tons || null, b.status || "ACTIVE"]
    );
    const [rows] = await pool.query("SELECT * FROM vendor_vehicles WHERE id=? LIMIT 1", [result.insertId]);
    return ok(res, rows?.[0] || null, "Vendor vehicle created");
  } catch (e) { next(e); }
});

r.delete("/vehicles/:id", async (req, res, next) => {
  try {
    await pool.query(
      `DELETE vv
       FROM vendor_vehicles vv
       JOIN vendors v ON v.id = vv.vendor_id
       WHERE vv.id=? AND v.company_id=?`,
      [req.params.id, req.user.company_id]
    );
    return ok(res, true, "Vendor vehicle deleted");
  } catch (e) { next(e); }
});

r.get("/subcontract-trips", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT st.*, v.name AS vendor_name, vv.vehicle_no AS vendor_vehicle_no, t.trip_code
       FROM subcontract_trips st
       JOIN vendors v ON v.id = st.vendor_id
       LEFT JOIN vendor_vehicles vv ON vv.id = st.vendor_vehicle_id
       LEFT JOIN trips t ON t.id = st.trip_id
       WHERE st.company_id=?
       ORDER BY st.id DESC`,
      [req.user.company_id]
    );
    return ok(res, rows, "Subcontract trips");
  } catch (e) { next(e); }
});

r.post("/subcontract-trips", async (req, res, next) => {
  try {
    const b = req.body || {};
    const [vrows] = await pool.query("SELECT id FROM vendors WHERE id=? AND company_id=? LIMIT 1", [b.vendor_id, req.user.company_id]);
    if (!vrows?.[0]) return res.status(400).json({ message: "Invalid vendor" });

    const [result] = await pool.query(
      `INSERT INTO subcontract_trips
        (company_id, trip_id, vendor_id, vendor_vehicle_id, freight_amount, status, assigned_on, note)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        req.user.company_id,
        b.trip_id || null,
        b.vendor_id,
        b.vendor_vehicle_id || null,
        b.freight_amount || 0,
        b.status || "ASSIGNED",
        b.assigned_on,
        b.note || null,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM subcontract_trips WHERE id=? LIMIT 1", [result.insertId]);
    return ok(res, rows?.[0] || null, "Subcontract trip created");
  } catch (e) { next(e); }
});

r.put("/subcontract-trips/:id", async (req, res, next) => {
  try {
    const b = req.body || {};
    const fields = [];
    const vals = [];
    for (const k of ["trip_id", "vendor_id", "vendor_vehicle_id", "freight_amount", "status", "assigned_on", "note"]) {
      if (k in b) { fields.push(`${k}=?`); vals.push(b[k]); }
    }
    if (fields.length) {
      vals.push(req.params.id, req.user.company_id);
      await pool.query(`UPDATE subcontract_trips SET ${fields.join(", ")} WHERE id=? AND company_id=?`, vals);
    }
    const [rows] = await pool.query("SELECT * FROM subcontract_trips WHERE id=? AND company_id=? LIMIT 1", [req.params.id, req.user.company_id]);
    return ok(res, rows?.[0] || null, "Subcontract trip updated");
  } catch (e) { next(e); }
});

r.get("/settlements", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT vs.*, v.name AS vendor_name
       FROM vendor_settlements vs
       JOIN vendors v ON v.id = vs.vendor_id
       WHERE vs.company_id=?
       ORDER BY vs.id DESC`,
      [req.user.company_id]
    );
    return ok(res, rows, "Vendor settlements");
  } catch (e) { next(e); }
});

r.post("/settlements", async (req, res, next) => {
  try {
    const b = req.body || {};
    const netAmount = Number(b.net_amount ?? (Number(b.gross_amount || 0) - Number(b.deductions || 0)));
    const [result] = await pool.query(
      `INSERT INTO vendor_settlements
        (company_id, vendor_id, settlement_date, gross_amount, deductions, net_amount, status, note)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        req.user.company_id,
        b.vendor_id,
        b.settlement_date,
        b.gross_amount || 0,
        b.deductions || 0,
        netAmount,
        b.status || "PENDING",
        b.note || null,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM vendor_settlements WHERE id=? LIMIT 1", [result.insertId]);
    return ok(res, rows?.[0] || null, "Vendor settlement created");
  } catch (e) { next(e); }
});

export default r;
