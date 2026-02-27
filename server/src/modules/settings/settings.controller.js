import { pool } from "../../config/db.js";
import { ok } from "../../utils/response.js";
import { writeAuditLog } from "../../utils/audit.js";

async function getSettings(companyId) {
  const [rows] = await pool.query(
    `SELECT cs.*, c.name AS company_name
     FROM company_settings cs
     JOIN companies c ON c.id = cs.company_id
     WHERE cs.company_id = ?
     LIMIT 1`,
    [companyId]
  );

  if (rows?.[0]) return rows[0];

  const [companyRows] = await pool.query("SELECT id, name FROM companies WHERE id = ? LIMIT 1", [companyId]);
  const company = companyRows?.[0];
  if (!company) return null;

  await pool.query(
    `INSERT INTO company_settings
      (company_id, brand_name, logo_url, primary_color, secondary_color, support_email, support_phone, invoice_footer)
     VALUES (?, ?, NULL, NULL, NULL, NULL, NULL, NULL)
     ON DUPLICATE KEY UPDATE brand_name = VALUES(brand_name)`,
    [company.id, company.name]
  );

  const [refetch] = await pool.query(
    `SELECT cs.*, c.name AS company_name
     FROM company_settings cs
     JOIN companies c ON c.id = cs.company_id
     WHERE cs.company_id = ?
     LIMIT 1`,
    [companyId]
  );

  return refetch?.[0] || null;
}

export async function getCompanySettings(req, res, next) {
  try {
    const settings = await getSettings(req.user.company_id);
    if (!settings) return res.status(404).json({ message: "Company settings not found" });
    return ok(res, settings, "Company settings");
  } catch (e) {
    next(e);
  }
}

export async function updateCompanySettings(req, res, next) {
  try {
    const body = req.validated.body;

    await pool.query(
      `INSERT INTO company_settings
        (company_id, brand_name, company_address, gst_no, gst_type, financial_year_start, invoice_prefix, invoice_series,
         logo_url, primary_color, secondary_color, ui_style, support_email, support_phone, invoice_footer,
         notify_email, notify_whatsapp, notify_sms, feature_toggles)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        brand_name = VALUES(brand_name),
        company_address = VALUES(company_address),
        gst_no = VALUES(gst_no),
        gst_type = VALUES(gst_type),
        financial_year_start = VALUES(financial_year_start),
        invoice_prefix = VALUES(invoice_prefix),
        invoice_series = VALUES(invoice_series),
        logo_url = VALUES(logo_url),
        primary_color = VALUES(primary_color),
        secondary_color = VALUES(secondary_color),
        ui_style = VALUES(ui_style),
        support_email = VALUES(support_email),
        support_phone = VALUES(support_phone),
        invoice_footer = VALUES(invoice_footer),
        notify_email = VALUES(notify_email),
        notify_whatsapp = VALUES(notify_whatsapp),
        notify_sms = VALUES(notify_sms),
        feature_toggles = VALUES(feature_toggles)`,
      [
        req.user.company_id,
        body.brand_name || null,
        body.company_address || null,
        body.gst_no || null,
        body.gst_type || null,
        body.financial_year_start || null,
        body.invoice_prefix || null,
        body.invoice_series || 1,
        body.logo_url || null,
        body.primary_color || null,
        body.secondary_color || null,
        body.ui_style || "CLASSIC",
        body.support_email || null,
        body.support_phone || null,
        body.invoice_footer || null,
        body.notify_email == null ? true : !!body.notify_email,
        body.notify_whatsapp == null ? false : !!body.notify_whatsapp,
        body.notify_sms == null ? false : !!body.notify_sms,
        body.feature_toggles ? JSON.stringify(body.feature_toggles) : null,
      ]
    );

    if (body.brand_name) {
      await pool.query("UPDATE companies SET name = ? WHERE id = ?", [body.brand_name, req.user.company_id]);
    }

    await writeAuditLog({
      company_id: req.user.company_id,
      actor_user_id: req.user.id,
      action: "SETTINGS_UPDATE",
      module: "settings",
      entity: "company_settings",
      entity_id: String(req.user.company_id),
      meta: body,
      ip: req.ip,
      user_agent: req.headers["user-agent"] || null,
    });

    const settings = await getSettings(req.user.company_id);
    return ok(res, settings, "Company settings updated");
  } catch (e) {
    next(e);
  }
}

export async function getThemeSettings(req, res, next) {
  try {
    const settings = await getSettings(req.user.company_id);
    if (!settings) return res.status(404).json({ message: "Company settings not found" });
    return ok(
      res,
      {
        brand_name: settings.brand_name || settings.company_name || "Vertex Transport Manager",
        logo_url: settings.logo_url || null,
        primary_color: settings.primary_color || null,
        secondary_color: settings.secondary_color || null,
        ui_style: settings.ui_style || "CLASSIC",
      },
      "Theme settings"
    );
  } catch (e) {
    next(e);
  }
}

export async function listBranches(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM company_branches WHERE company_id=? ORDER BY id DESC", [req.user.company_id]);
    return ok(res, rows, "Branches");
  } catch (e) {
    next(e);
  }
}

export async function createBranch(req, res, next) {
  try {
    const b = req.validated.body;
    const [res1] = await pool.query(
      `INSERT INTO company_branches
       (company_id, name, address, city, state, pincode, contact_name, contact_phone, is_hub, status)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        req.user.company_id,
        b.name,
        b.address || null,
        b.city || null,
        b.state || null,
        b.pincode || null,
        b.contact_name || null,
        b.contact_phone || null,
        b.is_hub ? 1 : 0,
        b.status || "ACTIVE",
      ]
    );
    const [rows] = await pool.query("SELECT * FROM company_branches WHERE id=? LIMIT 1", [res1.insertId]);
    return ok(res, rows[0], "Branch created");
  } catch (e) {
    next(e);
  }
}

export async function updateBranch(req, res, next) {
  try {
    const b = req.validated.body;
    const fields = [];
    const vals = [];
    for (const k of ["name", "address", "city", "state", "pincode", "contact_name", "contact_phone", "status"]) {
      if (k in b) {
        fields.push(`${k}=?`);
        vals.push(b[k] || null);
      }
    }
    if ("is_hub" in b) {
      fields.push("is_hub=?");
      vals.push(b.is_hub ? 1 : 0);
    }
    if (!fields.length) return res.status(400).json({ message: "No fields to update" });

    vals.push(req.params.id, req.user.company_id);
    await pool.query(`UPDATE company_branches SET ${fields.join(", ")} WHERE id=? AND company_id=?`, vals);
    const [rows] = await pool.query("SELECT * FROM company_branches WHERE id=? AND company_id=? LIMIT 1", [req.params.id, req.user.company_id]);
    return ok(res, rows?.[0] || null, "Branch updated");
  } catch (e) {
    next(e);
  }
}

export async function deleteBranch(req, res, next) {
  try {
    await pool.query("DELETE FROM company_branches WHERE id=? AND company_id=?", [req.params.id, req.user.company_id]);
    return ok(res, true, "Branch deleted");
  } catch (e) {
    next(e);
  }
}

function csvEscape(v) {
  const s = v == null ? "" : String(v);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((h) => csvEscape(row[h])).join(","));
  return lines.join("\n");
}

export async function exportMasterData(req, res, next) {
  try {
    const { entity } = req.params;
    const companyId = req.user.company_id;
    let rows = [];

    if (entity === "vehicles") {
      [rows] = await pool.query("SELECT * FROM vehicles WHERE company_id=? ORDER BY id DESC", [companyId]);
    } else if (entity === "drivers") {
      [rows] = await pool.query("SELECT * FROM drivers WHERE company_id=? ORDER BY id DESC", [companyId]);
    } else if (entity === "trips") {
      [rows] = await pool.query("SELECT * FROM trips WHERE company_id=? ORDER BY id DESC", [companyId]);
    } else if (entity === "invoices") {
      [rows] = await pool.query("SELECT * FROM invoices WHERE company_id=? ORDER BY id DESC", [companyId]);
    } else {
      return res.status(400).json({ message: "Unsupported export entity" });
    }

    const csv = toCsv(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${entity}.csv`);
    return res.send(csv);
  } catch (e) {
    next(e);
  }
}
