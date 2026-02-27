import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";
import { pool } from "../../config/db.js";
import { ok } from "../../utils/response.js";
import { Permissions } from "../../constants/permissions.js";

const r = Router();
r.use(requireAuth);

// Customers (MVP)
r.get("/customers", requirePermission(Permissions.BILLING_CUSTOMERS_VIEW), async (req,res,next)=>{
  try {
    const [rows] = await pool.query(
      "SELECT * FROM customers WHERE company_id=? OR ? IS NULL ORDER BY id DESC",
      [req.user.company_id, req.user.company_id]
    );
    return ok(res, rows, "Customers");
  } catch(e){ next(e); }
});

r.post("/customers", requirePermission(Permissions.BILLING_CUSTOMERS_MANAGE), async (req,res,next)=>{
  try {
    const { name, gst_no, phone, email } = req.body || {};
    const [r1] = await pool.query(
      "INSERT INTO customers (company_id, name, gst_no, phone, email) VALUES (?,?,?,?,?)",
      [req.user.company_id, name, gst_no||null, phone||null, email||null]
    );
    const [rows] = await pool.query("SELECT * FROM customers WHERE id=? LIMIT 1", [r1.insertId]);
    return ok(res, rows[0], "Customer created");
  } catch(e){ next(e); }
});

// Invoices (MVP lite)
r.get("/invoices", requirePermission(Permissions.BILLING_INVOICES_VIEW), async (req,res,next)=>{
  try {
    const [rows] = await pool.query(
      `SELECT i.*, c.name as customer_name
       FROM invoices i JOIN customers c ON c.id=i.customer_id
       WHERE i.company_id=? OR ? IS NULL
       ORDER BY i.id DESC`
      ,
      [req.user.company_id, req.user.company_id]
    );
    return ok(res, rows, "Invoices");
  } catch(e){ next(e); }
});

r.get("/invoices/outstanding", requirePermission(Permissions.BILLING_INVOICES_VIEW), async (req,res,next)=>{
  try {
    const [rows] = await pool.query(
      `SELECT i.*, c.name AS customer_name, (i.total - i.amount_paid) AS outstanding_amount
       FROM invoices i
       JOIN customers c ON c.id=i.customer_id
       WHERE (i.company_id=? OR ? IS NULL)
         AND (i.total - i.amount_paid) > 0
       ORDER BY i.id DESC`,
      [req.user.company_id, req.user.company_id]
    );
    return ok(res, rows, "Outstanding invoices");
  } catch(e){ next(e); }
});

function csvEscape(v) {
  const s = v == null ? "" : String(v);
  if (s.includes(",") || s.includes("\n") || s.includes("\"")) return `"${s.replace(/"/g, "\"\"")}"`;
  return s;
}

r.post("/invoices", requirePermission(Permissions.BILLING_INVOICES_MANAGE), async (req,res,next)=>{
  try {
    const { customer_id, invoice_no, invoice_date, subtotal, tax_total, total } = req.body || {};
    const [customerRows] = await pool.query(
      "SELECT id FROM customers WHERE id=? AND (company_id=? OR ? IS NULL) LIMIT 1",
      [customer_id, req.user.company_id, req.user.company_id]
    );
    if (!customerRows?.[0]) return res.status(400).json({ message: "Invalid customer" });

    const [r1] = await pool.query(
      "INSERT INTO invoices (company_id, customer_id, invoice_no, invoice_date, subtotal, tax_total, total) VALUES (?,?,?,?,?,?,?)",
      [req.user.company_id, customer_id, invoice_no, invoice_date, subtotal, tax_total, total]
    );
    const [rows] = await pool.query("SELECT * FROM invoices WHERE id=? LIMIT 1", [r1.insertId]);
    return ok(res, rows[0], "Invoice created");
  } catch(e){ next(e); }
});

r.get("/invoices/export", requirePermission(Permissions.BILLING_EXPORT, Permissions.BILLING_INVOICES_VIEW), async (req,res,next)=>{
  try {
    const [rows] = await pool.query(
      `SELECT i.invoice_no, i.invoice_date, c.name AS customer_name, i.total, i.amount_paid, i.status
       FROM invoices i
       JOIN customers c ON c.id=i.customer_id
       WHERE (i.company_id=? OR ? IS NULL)
       ORDER BY i.id DESC`,
      [req.user.company_id, req.user.company_id]
    );
    const headers = ["invoice_no","invoice_date","customer_name","total","amount_paid","status"];
    const lines = [headers.join(",")];
    for (const row of rows) lines.push(headers.map((h) => csvEscape(row[h])).join(","));
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=invoices.csv");
    return res.send(lines.join("\n"));
  } catch(e){ next(e); }
});

export default r;
