import { pool } from "../../config/db.js";

function listWhere(companyId, driverId) {
  if (driverId) {
    return {
      where: "t.company_id=? AND t.driver_id=?",
      params: [companyId, driverId],
    };
  }
  return {
    where: "(t.company_id=? OR ? IS NULL)",
    params: [companyId, companyId],
  };
}

export async function listTrips(companyId, driverId = null) {
  const { where, params } = listWhere(companyId, driverId);
  const [rows] = await pool.query(
    `SELECT t.*, v.vehicle_no, d.name AS driver_name
     FROM trips t
     LEFT JOIN vehicles v ON v.id=t.vehicle_id
     LEFT JOIN drivers d ON d.id=t.driver_id
     WHERE ${where}
     ORDER BY t.id DESC`,
    params
  );
  return rows;
}

export async function getTrip(id, companyId, driverId = null) {
  const { where, params } = listWhere(companyId, driverId);
  const [rows] = await pool.query(
    `SELECT t.*, v.vehicle_no, d.name AS driver_name
     FROM trips t
     LEFT JOIN vehicles v ON v.id=t.vehicle_id
     LEFT JOIN drivers d ON d.id=t.driver_id
     WHERE t.id=? AND ${where}
     LIMIT 1`,
    [id, ...params]
  );
  return rows?.[0] || null;
}

export async function createTrip(companyId, t) {
  const [res] = await pool.query(
    `INSERT INTO trips (company_id, trip_code, vehicle_id, driver_id, origin, destination, start_date, end_date)
     VALUES (?,?,?,?,?,?,?,?)`,
    [companyId, t.trip_code, t.vehicle_id || null, t.driver_id || null, t.origin, t.destination, t.start_date || null, t.end_date || null]
  );
  return await getTrip(res.insertId, companyId);
}

export async function updateTrip(id, companyId, t, driverId = null) {
  const fields = [];
  const vals = [];
  for (const k of ["vehicle_id","driver_id","start_date","end_date","status"]) {
    if (k in t) { fields.push(`${k}=?`); vals.push(t[k]); }
  }
  if (!fields.length) return await getTrip(id, companyId, driverId);
  vals.push(id, companyId);
  let sql = `UPDATE trips SET ${fields.join(", ")} WHERE id=? AND company_id=?`;
  if (driverId) {
    sql += " AND driver_id=?";
    vals.push(driverId);
  }
  await pool.query(sql, vals);
  return await getTrip(id, companyId, driverId);
}

export async function deleteTrip(id, companyId) {
  await pool.query("DELETE FROM trips WHERE id=? AND company_id=?", [id, companyId]);
  return true;
}

export async function addExpense(tripId, companyId, e, driverId = null) {
  const trip = await getTrip(tripId, companyId, driverId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
  const [res] = await pool.query(
    "INSERT INTO trip_expenses (trip_id, expense_type, amount, note) VALUES (?,?,?,?)",
    [tripId, e.expense_type, e.amount, e.note || null]
  );
  const [rows] = await pool.query("SELECT * FROM trip_expenses WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listExpenses(tripId, companyId, driverId = null) {
  const trip = await getTrip(tripId, companyId, driverId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
  const [rows] = await pool.query("SELECT * FROM trip_expenses WHERE trip_id=? ORDER BY id DESC", [tripId]);
  return rows;
}

export async function reviewExpense(expenseId, status, reviewerId) {
  await pool.query(
    "UPDATE trip_expenses SET approval_status=?, approved_by=?, approved_at=NOW() WHERE id=?",
    [status, reviewerId, expenseId]
  );
  const [rows] = await pool.query("SELECT * FROM trip_expenses WHERE id=? LIMIT 1", [expenseId]);
  return rows?.[0] || null;
}

export async function addPod(tripId, companyId, filePath, driverId = null) {
  const trip = await getTrip(tripId, companyId, driverId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
  const [res] = await pool.query(
    "INSERT INTO trip_pods (trip_id, file_path) VALUES (?,?)",
    [tripId, filePath]
  );
  const [rows] = await pool.query("SELECT * FROM trip_pods WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listPods(tripId, companyId, driverId = null) {
  const trip = await getTrip(tripId, companyId, driverId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
  const [rows] = await pool.query("SELECT * FROM trip_pods WHERE trip_id=? ORDER BY id DESC", [tripId]);
  return rows;
}

export async function reviewPod(podId, status, reviewerId) {
  await pool.query(
    "UPDATE trip_pods SET approval_status=?, approved_by=?, approved_at=NOW() WHERE id=?",
    [status, reviewerId, podId]
  );
  const [rows] = await pool.query("SELECT * FROM trip_pods WHERE id=? LIMIT 1", [podId]);
  return rows?.[0] || null;
}
