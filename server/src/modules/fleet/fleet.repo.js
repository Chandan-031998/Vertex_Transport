import { pool } from "../../config/db.js";

async function ensureVehicleForCompany(vehicleId, companyId) {
  const [rows] = await pool.query(
    "SELECT * FROM vehicles WHERE id=? AND (company_id=? OR ? IS NULL) LIMIT 1",
    [vehicleId, companyId, companyId]
  );
  const vehicle = rows?.[0] || null;
  if (!vehicle) throw Object.assign(new Error("Vehicle not found"), { status: 404 });
  return vehicle;
}

export async function listVehicles(companyId) {
  const [rows] = await pool.query(
    "SELECT * FROM vehicles WHERE company_id=? OR ? IS NULL ORDER BY id DESC",
    [companyId, companyId]
  );
  return rows;
}

export async function getVehicle(id) {
  const [rows] = await pool.query("SELECT * FROM vehicles WHERE id=? LIMIT 1", [id]);
  return rows?.[0] || null;
}

export async function createVehicle(companyId, data) {
  const [res] = await pool.query(
    `INSERT INTO vehicles (
      company_id, vehicle_no, vehicle_type, make, model, year,
      chassis_number, engine_number, fuel_type, vehicle_capacity_tons, odometer_reading, fuel_tank_capacity_liters,
      rc_owner_name, rc_owner_address,
      insurance_provider, policy_number, insurance_start_date, insurance_expiry_date,
      permit_type, permit_state, permit_expiry_date,
      gps_device_id, fastag_id,
      purchase_date, purchase_cost, loan_emi, emi_due_date
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      companyId,
      data.vehicle_no,
      data.vehicle_type,
      data.make || null,
      data.model || null,
      data.year || null,
      data.chassis_number || null,
      data.engine_number || null,
      data.fuel_type || null,
      data.vehicle_capacity_tons ?? null,
      data.odometer_reading ?? null,
      data.fuel_tank_capacity_liters ?? null,
      data.rc_owner_name || null,
      data.rc_owner_address || null,
      data.insurance_provider || null,
      data.policy_number || null,
      data.insurance_start_date || null,
      data.insurance_expiry_date || null,
      data.permit_type || null,
      data.permit_state || null,
      data.permit_expiry_date || null,
      data.gps_device_id || null,
      data.fastag_id || null,
      data.purchase_date || null,
      data.purchase_cost ?? null,
      data.loan_emi ?? null,
      data.emi_due_date || null,
    ]
  );
  return await getVehicle(res.insertId);
}

export async function updateVehicle(id, data) {
  const fields = [];
  const vals = [];
  for (const k of [
    "vehicle_type", "make", "model", "year", "status",
    "chassis_number", "engine_number", "fuel_type", "vehicle_capacity_tons", "odometer_reading", "fuel_tank_capacity_liters",
    "rc_owner_name", "rc_owner_address",
    "insurance_provider", "policy_number", "insurance_start_date", "insurance_expiry_date",
    "permit_type", "permit_state", "permit_expiry_date",
    "gps_device_id", "fastag_id",
    "purchase_date", "purchase_cost", "loan_emi", "emi_due_date",
  ]) {
    if (k in data) {
      fields.push(`${k}=?`);
      vals.push(data[k]);
    }
  }
  if (!fields.length) return await getVehicle(id);
  vals.push(id);
  await pool.query(`UPDATE vehicles SET ${fields.join(", ")} WHERE id=?`, vals);
  return await getVehicle(id);
}

export async function deleteVehicle(id) {
  await pool.query("DELETE FROM vehicles WHERE id=?", [id]);
  return true;
}

export async function addVehicleDocument(vehicleId, doc) {
  const [res] = await pool.query(
    "INSERT INTO vehicle_documents (vehicle_id, doc_type, doc_no, expiry_date, file_path) VALUES (?,?,?,?,?)",
    [vehicleId, doc.doc_type, doc.doc_no || null, doc.expiry_date || null, doc.file_path || null]
  );
  const [rows] = await pool.query("SELECT * FROM vehicle_documents WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listVehicleDocuments(vehicleId) {
  const [rows] = await pool.query("SELECT * FROM vehicle_documents WHERE vehicle_id=? ORDER BY id DESC", [vehicleId]);
  return rows;
}

export async function createMaintenanceSchedule(companyId, data) {
  await ensureVehicleForCompany(data.vehicle_id, companyId);
  const [res] = await pool.query(
    `INSERT INTO maintenance_schedules
      (vehicle_id, service_type, due_date, due_odometer, reminder_days, last_service_date, notes)
     VALUES (?,?,?,?,?,?,?)`,
    [
      data.vehicle_id,
      data.service_type,
      data.due_date || null,
      data.due_odometer || null,
      data.reminder_days ?? 7,
      data.last_service_date || null,
      data.notes || null,
    ]
  );
  const [rows] = await pool.query("SELECT * FROM maintenance_schedules WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listMaintenanceSchedules(companyId) {
  const [rows] = await pool.query(
    `SELECT ms.*, v.vehicle_no
     FROM maintenance_schedules ms
     JOIN vehicles v ON v.id = ms.vehicle_id
     WHERE v.company_id=? OR ? IS NULL
     ORDER BY ms.id DESC`,
    [companyId, companyId]
  );
  return rows;
}

export async function createTyre(companyId, data) {
  await ensureVehicleForCompany(data.vehicle_id, companyId);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.query(
      `INSERT INTO tyres (vehicle_id, tyre_code, position_code, installed_on, purchase_cost)
       VALUES (?,?,?,?,?)`,
      [data.vehicle_id, data.tyre_code, data.position_code, data.installed_on, data.purchase_cost || 0]
    );

    await conn.query(
      `INSERT INTO tyre_position_history
        (tyre_id, vehicle_id, from_position_code, to_position_code, moved_on, odometer, cost, notes)
       VALUES (?, ?, NULL, ?, ?, NULL, 0, 'Initial install')`,
      [res.insertId, data.vehicle_id, data.position_code, data.installed_on]
    );

    await conn.commit();

    const [rows] = await pool.query(
      `SELECT t.*, v.vehicle_no
       FROM tyres t
       JOIN vehicles v ON v.id=t.vehicle_id
       WHERE t.id=? LIMIT 1`,
      [res.insertId]
    );
    return rows?.[0] || null;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function moveTyre(companyId, tyreId, data) {
  const [tyreRows] = await pool.query(
    `SELECT t.*
     FROM tyres t
     JOIN vehicles v ON v.id=t.vehicle_id
     WHERE t.id=? AND (v.company_id=? OR ? IS NULL)
     LIMIT 1`,
    [tyreId, companyId, companyId]
  );
  const tyre = tyreRows?.[0];
  if (!tyre) throw Object.assign(new Error("Tyre not found"), { status: 404 });

  const fromPosition = tyre.position_code;
  await pool.query("UPDATE tyres SET position_code=? WHERE id=?", [data.to_position_code, tyreId]);
  await pool.query(
    `INSERT INTO tyre_position_history
      (tyre_id, vehicle_id, from_position_code, to_position_code, moved_on, odometer, cost, notes)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      tyreId,
      tyre.vehicle_id,
      fromPosition,
      data.to_position_code,
      data.moved_on,
      data.odometer || null,
      data.cost || 0,
      data.notes || null,
    ]
  );

  const [rows] = await pool.query("SELECT * FROM tyres WHERE id=? LIMIT 1", [tyreId]);
  return rows?.[0] || null;
}

export async function replaceTyre(companyId, tyreId, data) {
  const [tyreRows] = await pool.query(
    `SELECT t.*
     FROM tyres t
     JOIN vehicles v ON v.id=t.vehicle_id
     WHERE t.id=? AND (v.company_id=? OR ? IS NULL)
     LIMIT 1`,
    [tyreId, companyId, companyId]
  );
  const tyre = tyreRows?.[0];
  if (!tyre) throw Object.assign(new Error("Tyre not found"), { status: 404 });

  await pool.query("UPDATE tyres SET status='REPLACED', removed_on=? WHERE id=?", [data.removed_on, tyreId]);
  await pool.query(
    `INSERT INTO tyre_position_history
      (tyre_id, vehicle_id, from_position_code, to_position_code, moved_on, odometer, cost, notes)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      tyreId,
      tyre.vehicle_id,
      tyre.position_code,
      tyre.position_code,
      data.removed_on,
      null,
      data.replacement_cost || 0,
      data.notes || "Tyre replaced",
    ]
  );

  const [rows] = await pool.query("SELECT * FROM tyres WHERE id=? LIMIT 1", [tyreId]);
  return rows?.[0] || null;
}

export async function listTyres(companyId) {
  const [rows] = await pool.query(
    `SELECT t.*, v.vehicle_no
     FROM tyres t
     JOIN vehicles v ON v.id=t.vehicle_id
     WHERE v.company_id=? OR ? IS NULL
     ORDER BY t.id DESC`,
    [companyId, companyId]
  );
  return rows;
}

export async function listTyreHistory(companyId, tyreId) {
  const [rows] = await pool.query(
    `SELECT tph.*
     FROM tyre_position_history tph
     JOIN vehicles v ON v.id=tph.vehicle_id
     WHERE tph.tyre_id=? AND (v.company_id=? OR ? IS NULL)
     ORDER BY tph.id DESC`,
    [tyreId, companyId, companyId]
  );
  return rows;
}

async function getFuelMileageBaseline(vehicleId) {
  const [rows] = await pool.query(
    `SELECT actual_mileage
     FROM fuel_logs
     WHERE vehicle_id=? AND actual_mileage IS NOT NULL
     ORDER BY id DESC
     LIMIT 3`,
    [vehicleId]
  );
  const values = rows.map((r) => Number(r.actual_mileage)).filter((n) => Number.isFinite(n) && n > 0);
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function createFuelLog(companyId, data) {
  await ensureVehicleForCompany(data.vehicle_id, companyId);

  const [prevRows] = await pool.query(
    "SELECT odometer FROM fuel_logs WHERE vehicle_id=? ORDER BY log_date DESC, id DESC LIMIT 1",
    [data.vehicle_id]
  );

  let actualMileage = null;
  if (prevRows?.[0]?.odometer != null && Number(data.liters) > 0) {
    const delta = Number(data.odometer) - Number(prevRows[0].odometer);
    if (delta > 0) actualMileage = delta / Number(data.liters);
  }

  const expectedMileage = data.expected_mileage || (await getFuelMileageBaseline(data.vehicle_id));
  let theftFlag = 0;
  let theftVariancePct = null;

  if (expectedMileage && actualMileage && actualMileage < expectedMileage * 0.8) {
    theftFlag = 1;
    theftVariancePct = ((expectedMileage - actualMileage) / expectedMileage) * 100;
  }

  const [res] = await pool.query(
    `INSERT INTO fuel_logs
      (vehicle_id, log_date, odometer, liters, amount, fuel_station, expected_mileage, actual_mileage, theft_flag, theft_variance_pct)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      data.vehicle_id,
      data.log_date,
      data.odometer,
      data.liters,
      data.amount,
      data.fuel_station || null,
      expectedMileage || null,
      actualMileage || null,
      theftFlag,
      theftVariancePct || null,
    ]
  );

  const [rows] = await pool.query("SELECT * FROM fuel_logs WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listFuelLogs(companyId) {
  const [rows] = await pool.query(
    `SELECT fl.*, v.vehicle_no
     FROM fuel_logs fl
     JOIN vehicles v ON v.id=fl.vehicle_id
     WHERE v.company_id=? OR ? IS NULL
     ORDER BY fl.log_date DESC, fl.id DESC`,
    [companyId, companyId]
  );
  return rows;
}

export async function getFuelTheftSignals(companyId) {
  const [rows] = await pool.query(
    `SELECT fl.*, v.vehicle_no
     FROM fuel_logs fl
     JOIN vehicles v ON v.id=fl.vehicle_id
     WHERE (v.company_id=? OR ? IS NULL) AND fl.theft_flag=1
     ORDER BY fl.log_date DESC, fl.id DESC`,
    [companyId, companyId]
  );
  return rows;
}

export async function createBreakdown(companyId, data) {
  await ensureVehicleForCompany(data.vehicle_id, companyId);
  const [res] = await pool.query(
    `INSERT INTO breakdowns (vehicle_id, breakdown_at, location, issue, severity)
     VALUES (?,?,?,?,?)`,
    [data.vehicle_id, data.breakdown_at, data.location || null, data.issue, data.severity || "MEDIUM"]
  );
  const [rows] = await pool.query("SELECT * FROM breakdowns WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listBreakdowns(companyId) {
  const [rows] = await pool.query(
    `SELECT b.*, v.vehicle_no
     FROM breakdowns b
     JOIN vehicles v ON v.id=b.vehicle_id
     WHERE v.company_id=? OR ? IS NULL
     ORDER BY b.id DESC`,
    [companyId, companyId]
  );
  return rows;
}

export async function createAmc(companyId, data) {
  await ensureVehicleForCompany(data.vehicle_id, companyId);
  const [res] = await pool.query(
    `INSERT INTO amc_contracts (vehicle_id, provider_name, start_date, end_date, cost, notes)
     VALUES (?,?,?,?,?,?)`,
    [data.vehicle_id, data.provider_name, data.start_date, data.end_date, data.cost || 0, data.notes || null]
  );
  const [rows] = await pool.query("SELECT * FROM amc_contracts WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listAmc(companyId) {
  const [rows] = await pool.query(
    `SELECT a.*, v.vehicle_no
     FROM amc_contracts a
     JOIN vehicles v ON v.id=a.vehicle_id
     WHERE v.company_id=? OR ? IS NULL
     ORDER BY a.id DESC`,
    [companyId, companyId]
  );
  return rows;
}

export async function getVehicleExpiryAlerts(companyId, withinDays = 30) {
  const [docRows] = await pool.query(
    `SELECT v.vehicle_no, vd.doc_type, vd.expiry_date,
            DATEDIFF(vd.expiry_date, CURDATE()) AS days_left
     FROM vehicle_documents vd
     JOIN vehicles v ON v.id = vd.vehicle_id
     WHERE (v.company_id=? OR ? IS NULL)
       AND vd.expiry_date IS NOT NULL
       AND vd.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY vd.expiry_date ASC`,
    [companyId, companyId, withinDays]
  );

  const [amcRows] = await pool.query(
    `SELECT v.vehicle_no, a.provider_name, a.end_date,
            DATEDIFF(a.end_date, CURDATE()) AS days_left
     FROM amc_contracts a
     JOIN vehicles v ON v.id = a.vehicle_id
     WHERE (v.company_id=? OR ? IS NULL)
       AND a.end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY a.end_date ASC`,
    [companyId, companyId, withinDays]
  );

  const [maintenanceRows] = await pool.query(
    `SELECT v.vehicle_no, ms.service_type, ms.due_date,
            DATEDIFF(ms.due_date, CURDATE()) AS days_left
     FROM maintenance_schedules ms
     JOIN vehicles v ON v.id = ms.vehicle_id
     WHERE (v.company_id=? OR ? IS NULL)
       AND ms.status IN ('SCHEDULED', 'DUE')
       AND ms.due_date IS NOT NULL
       AND ms.due_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY ms.due_date ASC`,
    [companyId, companyId, withinDays]
  );

  return {
    documents: docRows,
    amc: amcRows,
    maintenance: maintenanceRows,
  };
}

export async function getFleetSummary(companyId) {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total_fleet,
       SUM(CASE WHEN status='ACTIVE' THEN 1 ELSE 0 END) AS active_fleet,
       SUM(CASE WHEN status='MAINTENANCE' THEN 1 ELSE 0 END) AS maintenance_fleet,
       SUM(CASE WHEN status='INACTIVE' THEN 1 ELSE 0 END) AS inactive_fleet
     FROM vehicles
     WHERE company_id=? OR ? IS NULL`,
    [companyId, companyId]
  );
  const [idleRows] = await pool.query(
    `SELECT COUNT(*) AS idle_fleet
     FROM vehicles v
     WHERE (v.company_id=? OR ? IS NULL)
       AND v.status='ACTIVE'
       AND NOT EXISTS (
         SELECT 1
         FROM trips t
         WHERE t.vehicle_id=v.id
           AND t.status IN ('ASSIGNED','STARTED','IN_TRANSIT')
       )`,
    [companyId, companyId]
  );
  return { ...(rows?.[0] || {}), idle_fleet: idleRows?.[0]?.idle_fleet || 0 };
}

export async function getVehicleDocumentReminderBuckets(companyId, daysList = [30, 15, 7, 1]) {
  const buckets = {};
  for (const d of daysList) {
    const [rows] = await pool.query(
      `SELECT vd.doc_type, COUNT(*) AS count_items
       FROM vehicle_documents vd
       JOIN vehicles v ON v.id=vd.vehicle_id
       WHERE (v.company_id=? OR ? IS NULL)
         AND vd.expiry_date IS NOT NULL
         AND DATEDIFF(vd.expiry_date, CURDATE()) BETWEEN 0 AND ?
       GROUP BY vd.doc_type`,
      [companyId, companyId, d]
    );
    buckets[String(d)] = rows;
  }
  return buckets;
}
