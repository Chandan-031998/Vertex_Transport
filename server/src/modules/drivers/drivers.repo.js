import { pool } from "../../config/db.js";

async function ensureDriverForCompany(driverId, companyId) {
  const [rows] = await pool.query(
    "SELECT * FROM drivers WHERE id=? AND (company_id=? OR ? IS NULL) LIMIT 1",
    [driverId, companyId, companyId]
  );
  const driver = rows?.[0] || null;
  if (!driver) throw Object.assign(new Error("Driver not found"), { status: 404 });
  return driver;
}

export async function listDrivers(companyId) {
  const [rows] = await pool.query(
    "SELECT * FROM drivers WHERE company_id=? OR ? IS NULL ORDER BY id DESC",
    [companyId, companyId]
  );
  return rows;
}

export async function getDriver(id) {
  const [rows] = await pool.query("SELECT * FROM drivers WHERE id=? LIMIT 1", [id]);
  return rows?.[0] || null;
}

export async function createDriver(companyId, d) {
  const [res] = await pool.query(
    `INSERT INTO drivers (
      company_id, name, phone, license_no, license_expiry,
      date_of_birth, address, aadhaar_number, pan_number, blood_group, photo_path,
      emergency_contact_name, emergency_contact_phone,
      joining_date, experience_years, salary, commission_type, driving_badge_number,
      bank_name, account_number, ifsc_code, upi_id
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      companyId,
      d.name,
      d.phone || null,
      d.license_no || null,
      d.license_expiry || null,
      d.date_of_birth || null,
      d.address || null,
      d.aadhaar_number || null,
      d.pan_number || null,
      d.blood_group || null,
      d.photo_path || null,
      d.emergency_contact_name || null,
      d.emergency_contact_phone || null,
      d.joining_date || null,
      d.experience_years ?? null,
      d.salary ?? null,
      d.commission_type || null,
      d.driving_badge_number || null,
      d.bank_name || null,
      d.account_number || null,
      d.ifsc_code || null,
      d.upi_id || null,
    ]
  );
  return await getDriver(res.insertId);
}

export async function updateDriver(id, d) {
  const fields = [];
  const vals = [];
  for (const k of [
    "name", "phone", "license_no", "license_expiry",
    "date_of_birth", "address", "aadhaar_number", "pan_number", "blood_group", "photo_path",
    "emergency_contact_name", "emergency_contact_phone",
    "joining_date", "experience_years", "salary", "commission_type", "driving_badge_number",
    "bank_name", "account_number", "ifsc_code", "upi_id",
    "kyc_status", "status",
  ]) {
    if (k in d) {
      fields.push(`${k}=?`);
      vals.push(d[k]);
    }
  }
  if (!fields.length) return await getDriver(id);
  vals.push(id);
  await pool.query(`UPDATE drivers SET ${fields.join(", ")} WHERE id=?`, vals);
  return await getDriver(id);
}

export async function deleteDriver(id) {
  await pool.query("DELETE FROM drivers WHERE id=?", [id]);
  return true;
}

export async function updateDriverPhoto(companyId, driverId, filePath) {
  await ensureDriverForCompany(driverId, companyId);
  await pool.query("UPDATE drivers SET photo_path=? WHERE id=?", [filePath, driverId]);
  return await getDriver(driverId);
}

export async function addDriverKycDocument(companyId, driverId, data) {
  await ensureDriverForCompany(driverId, companyId);
  const [res] = await pool.query(
    `INSERT INTO driver_kyc_documents (driver_id, doc_type, doc_no, file_path)
     VALUES (?,?,?,?)`,
    [driverId, data.doc_type, data.doc_no || null, data.file_path || null]
  );
  const [rows] = await pool.query("SELECT * FROM driver_kyc_documents WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listDriverKycDocuments(companyId, driverId) {
  await ensureDriverForCompany(driverId, companyId);
  const [rows] = await pool.query(
    `SELECT dkd.*, u.name AS verified_by_name
     FROM driver_kyc_documents dkd
     LEFT JOIN users u ON u.id = dkd.verified_by
     WHERE dkd.driver_id=?
     ORDER BY dkd.id DESC`,
    [driverId]
  );
  return rows;
}

export async function updateDriverKycStatus(companyId, driverId, docId, data, verifierId) {
  await ensureDriverForCompany(driverId, companyId);
  const [docRows] = await pool.query(
    "SELECT * FROM driver_kyc_documents WHERE id=? AND driver_id=? LIMIT 1",
    [docId, driverId]
  );
  if (!docRows?.[0]) throw Object.assign(new Error("KYC document not found"), { status: 404 });

  await pool.query(
    `UPDATE driver_kyc_documents
     SET status=?, verified_by=?, verified_at=NOW(), reject_reason=?
     WHERE id=? AND driver_id=?`,
    [data.status, verifierId, data.status === "REJECTED" ? data.reject_reason || "Rejected" : null, docId, driverId]
  );

  const [aggRows] = await pool.query(
    `SELECT
       SUM(CASE WHEN status='PENDING' THEN 1 ELSE 0 END) AS pending_count,
       SUM(CASE WHEN status='REJECTED' THEN 1 ELSE 0 END) AS rejected_count,
       SUM(CASE WHEN status='VERIFIED' THEN 1 ELSE 0 END) AS verified_count
     FROM driver_kyc_documents
     WHERE driver_id=?`,
    [driverId]
  );

  const agg = aggRows?.[0] || { pending_count: 0, rejected_count: 0, verified_count: 0 };
  let kycStatus = "PENDING";
  if (Number(agg.rejected_count) > 0) kycStatus = "REJECTED";
  else if (Number(agg.pending_count) === 0 && Number(agg.verified_count) > 0) kycStatus = "VERIFIED";

  await pool.query("UPDATE drivers SET kyc_status=? WHERE id=?", [kycStatus, driverId]);

  const [rows] = await pool.query("SELECT * FROM driver_kyc_documents WHERE id=? LIMIT 1", [docId]);
  return rows?.[0] || null;
}

export async function addDriverCompensation(companyId, data) {
  await ensureDriverForCompany(data.driver_id, companyId);
  const [res] = await pool.query(
    `INSERT INTO driver_compensation
      (driver_id, monthly_salary, incentive_per_trip, incentive_per_km, effective_from, effective_to)
     VALUES (?,?,?,?,?,?)`,
    [
      data.driver_id,
      data.monthly_salary,
      data.incentive_per_trip || 0,
      data.incentive_per_km || 0,
      data.effective_from,
      data.effective_to || null,
    ]
  );
  const [rows] = await pool.query("SELECT * FROM driver_compensation WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listDriverCompensation(companyId, driverId) {
  await ensureDriverForCompany(driverId, companyId);
  const [rows] = await pool.query("SELECT * FROM driver_compensation WHERE driver_id=? ORDER BY id DESC", [driverId]);
  return rows;
}

export async function addDriverAdvance(companyId, data) {
  await ensureDriverForCompany(data.driver_id, companyId);
  const [res] = await pool.query(
    "INSERT INTO driver_advances (driver_id, advance_date, amount, note) VALUES (?,?,?,?)",
    [data.driver_id, data.advance_date, data.amount, data.note || null]
  );
  const [rows] = await pool.query("SELECT * FROM driver_advances WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listDriverAdvances(companyId, driverId) {
  await ensureDriverForCompany(driverId, companyId);
  const [rows] = await pool.query("SELECT * FROM driver_advances WHERE driver_id=? ORDER BY id DESC", [driverId]);
  return rows;
}

export async function addDriverSettlement(companyId, data) {
  await ensureDriverForCompany(data.driver_id, companyId);

  const requestedDeduction = Number(data.advance_deduction || 0);
  const [advanceRows] = await pool.query(
    "SELECT id, amount FROM driver_advances WHERE driver_id=? AND status='OPEN' ORDER BY advance_date ASC, id ASC",
    [data.driver_id]
  );

  const totalOpenAdvance = advanceRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const appliedDeduction = Math.min(requestedDeduction, totalOpenAdvance);
  const netAmount = Number(data.gross_amount) - appliedDeduction;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [res] = await conn.query(
      `INSERT INTO driver_settlements (driver_id, settlement_date, gross_amount, advance_deduction, net_amount, note)
       VALUES (?,?,?,?,?,?)`,
      [data.driver_id, data.settlement_date, data.gross_amount, appliedDeduction, netAmount, data.note || null]
    );

    let remaining = appliedDeduction;
    for (const adv of advanceRows) {
      if (remaining <= 0) break;
      const amount = Number(adv.amount || 0);
      if (amount <= remaining) {
        await conn.query("UPDATE driver_advances SET status='SETTLED' WHERE id=?", [adv.id]);
        remaining -= amount;
      }
    }

    await conn.commit();

    const [rows] = await pool.query("SELECT * FROM driver_settlements WHERE id=? LIMIT 1", [res.insertId]);
    return rows?.[0] || null;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function listDriverSettlements(companyId, driverId) {
  await ensureDriverForCompany(driverId, companyId);
  const [rows] = await pool.query("SELECT * FROM driver_settlements WHERE driver_id=? ORDER BY id DESC", [driverId]);
  return rows;
}

export async function calculateTripCommission(companyId, data) {
  await ensureDriverForCompany(data.driver_id, companyId);

  const [tripRows] = await pool.query(
    `SELECT COUNT(*) AS delivered_count
     FROM trips
     WHERE driver_id=?
       AND status IN ('DELIVERED','POD_SUBMITTED','CLOSED','SETTLED')
       AND start_date >= ?
       AND start_date <= ?`,
    [data.driver_id, data.period_from, data.period_to]
  );

  const deliveredTrips = Number(tripRows?.[0]?.delivered_count || 0);
  const ratePerTrip = Number(data.rate_per_trip || 0);
  const bonus = Number(data.incentive_bonus || 0);
  const totalCommission = deliveredTrips * ratePerTrip + bonus;

  const [res] = await pool.query(
    `INSERT INTO driver_trip_commissions
      (driver_id, period_from, period_to, delivered_trips, rate_per_trip, incentive_bonus, total_commission)
     VALUES (?,?,?,?,?,?,?)`,
    [data.driver_id, data.period_from, data.period_to, deliveredTrips, ratePerTrip, bonus, totalCommission]
  );

  const [rows] = await pool.query("SELECT * FROM driver_trip_commissions WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listDriverCommissions(companyId, driverId) {
  await ensureDriverForCompany(driverId, companyId);
  const [rows] = await pool.query("SELECT * FROM driver_trip_commissions WHERE driver_id=? ORDER BY id DESC", [driverId]);
  return rows;
}

export async function upsertDriverAttendance(companyId, data) {
  await ensureDriverForCompany(data.driver_id, companyId);
  await pool.query(
    `INSERT INTO driver_attendance
      (driver_id, attendance_date, check_in_at, check_in_lat, check_in_lng, check_out_at, check_out_lat, check_out_lng, source, status)
     VALUES (?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
      check_in_at=VALUES(check_in_at),
      check_in_lat=VALUES(check_in_lat),
      check_in_lng=VALUES(check_in_lng),
      check_out_at=VALUES(check_out_at),
      check_out_lat=VALUES(check_out_lat),
      check_out_lng=VALUES(check_out_lng),
      source=VALUES(source),
      status=VALUES(status)`,
    [
      data.driver_id,
      data.attendance_date,
      data.check_in_at || null,
      data.check_in_lat || null,
      data.check_in_lng || null,
      data.check_out_at || null,
      data.check_out_lat || null,
      data.check_out_lng || null,
      data.source || "APP",
      data.status || "PRESENT",
    ]
  );

  const [rows] = await pool.query(
    "SELECT * FROM driver_attendance WHERE driver_id=? AND attendance_date=? LIMIT 1",
    [data.driver_id, data.attendance_date]
  );
  return rows?.[0] || null;
}

export async function listDriverAttendance(companyId, driverId) {
  await ensureDriverForCompany(driverId, companyId);
  const [rows] = await pool.query("SELECT * FROM driver_attendance WHERE driver_id=? ORDER BY attendance_date DESC", [driverId]);
  return rows;
}

export async function generateDriverPerformance(companyId, data) {
  const driver = await ensureDriverForCompany(data.driver_id, companyId);

  const [attendanceRows] = await pool.query(
    `SELECT
      SUM(CASE WHEN status='PRESENT' THEN 1 ELSE 0 END) AS present_days,
      COUNT(*) AS total_days
     FROM driver_attendance
     WHERE driver_id=? AND attendance_date>=? AND attendance_date<=?`,
    [data.driver_id, data.period_from, data.period_to]
  );

  const presentDays = Number(attendanceRows?.[0]?.present_days || 0);
  const totalDays = Number(attendanceRows?.[0]?.total_days || 0);
  const attendanceScore = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  const [tripRows] = await pool.query(
    `SELECT COUNT(*) AS delivered_count
     FROM trips
     WHERE driver_id=?
       AND status IN ('DELIVERED','POD_SUBMITTED','CLOSED','SETTLED')
       AND start_date>=?
       AND start_date<=?`,
    [data.driver_id, data.period_from, data.period_to]
  );

  const deliveredCount = Number(tripRows?.[0]?.delivered_count || 0);
  const onTimeScore = Math.min(100, deliveredCount * 10);
  const safetyScore = driver.kyc_status === "VERIFIED" ? 85 : 65;
  const overallScore = onTimeScore * 0.4 + attendanceScore * 0.35 + safetyScore * 0.25;

  const [res] = await pool.query(
    `INSERT INTO driver_performance_scores
      (driver_id, period_from, period_to, on_time_score, attendance_score, safety_score, overall_score, remarks)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      data.driver_id,
      data.period_from,
      data.period_to,
      onTimeScore,
      attendanceScore,
      safetyScore,
      overallScore,
      data.remarks || null,
    ]
  );

  const [rows] = await pool.query("SELECT * FROM driver_performance_scores WHERE id=? LIMIT 1", [res.insertId]);
  return rows?.[0] || null;
}

export async function listDriverPerformance(companyId, driverId) {
  await ensureDriverForCompany(driverId, companyId);
  const [rows] = await pool.query("SELECT * FROM driver_performance_scores WHERE driver_id=? ORDER BY id DESC", [driverId]);
  return rows;
}

export async function upsertDriverStatutory(companyId, data) {
  await ensureDriverForCompany(data.driver_id, companyId);
  await pool.query(
    `INSERT INTO driver_statutory
      (driver_id, esi_no, pf_no, uan_no, esi_enrolled_on, pf_enrolled_on, status)
     VALUES (?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
      esi_no=VALUES(esi_no),
      pf_no=VALUES(pf_no),
      uan_no=VALUES(uan_no),
      esi_enrolled_on=VALUES(esi_enrolled_on),
      pf_enrolled_on=VALUES(pf_enrolled_on),
      status=VALUES(status)`,
    [
      data.driver_id,
      data.esi_no || null,
      data.pf_no || null,
      data.uan_no || null,
      data.esi_enrolled_on || null,
      data.pf_enrolled_on || null,
      data.status || "ACTIVE",
    ]
  );

  const [rows] = await pool.query("SELECT * FROM driver_statutory WHERE driver_id=? LIMIT 1", [data.driver_id]);
  return rows?.[0] || null;
}

export async function getDriverStatutory(companyId, driverId) {
  await ensureDriverForCompany(driverId, companyId);
  const [rows] = await pool.query("SELECT * FROM driver_statutory WHERE driver_id=? LIMIT 1", [driverId]);
  return rows?.[0] || null;
}

export async function getDriverLicenseExpiryAlerts(companyId, withinDays = 30) {
  const [rows] = await pool.query(
    `SELECT id, name, license_no, license_expiry, DATEDIFF(license_expiry, CURDATE()) AS days_left
     FROM drivers
     WHERE (company_id=? OR ? IS NULL)
       AND license_expiry IS NOT NULL
       AND license_expiry <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY license_expiry ASC`,
    [companyId, companyId, withinDays]
  );
  return rows;
}

export async function getDriverPerformanceOverview(companyId) {
  const [rows] = await pool.query(
    `SELECT d.id, d.name,
            COUNT(t.id) AS trip_count,
            AVG(ps.overall_score) AS avg_score
     FROM drivers d
     LEFT JOIN trips t ON t.driver_id=d.id
     LEFT JOIN driver_performance_scores ps ON ps.driver_id=d.id
     WHERE d.company_id=? OR ? IS NULL
     GROUP BY d.id
     ORDER BY trip_count DESC`,
    [companyId, companyId]
  );
  return rows;
}

export async function getDriverSettlementSummary(companyId, driverId) {
  await ensureDriverForCompany(driverId, companyId);

  const [[settlementRow]] = await pool.query(
    `SELECT
        COUNT(*) AS settlements_count,
        COALESCE(SUM(gross_amount), 0) AS total_gross,
        COALESCE(SUM(advance_deduction), 0) AS total_deduction,
        COALESCE(SUM(net_amount), 0) AS total_net
      FROM driver_settlements
      WHERE driver_id=?`,
    [driverId]
  );

  const [[advanceRow]] = await pool.query(
    `SELECT
        COALESCE(SUM(CASE WHEN status='OPEN' THEN amount ELSE 0 END), 0) AS open_advance_amount,
        COUNT(CASE WHEN status='OPEN' THEN 1 END) AS open_advance_count
      FROM driver_advances
      WHERE driver_id=?`,
    [driverId]
  );

  const [[commissionRow]] = await pool.query(
    `SELECT
        COALESCE(SUM(CASE WHEN status='PENDING' THEN total_commission ELSE 0 END), 0) AS pending_commission,
        COALESCE(SUM(CASE WHEN status='PAID' THEN total_commission ELSE 0 END), 0) AS paid_commission
      FROM driver_trip_commissions
      WHERE driver_id=?`,
    [driverId]
  );

  return {
    driver_id: Number(driverId),
    settlements_count: Number(settlementRow?.settlements_count || 0),
    total_gross: Number(settlementRow?.total_gross || 0),
    total_deduction: Number(settlementRow?.total_deduction || 0),
    total_net: Number(settlementRow?.total_net || 0),
    open_advance_amount: Number(advanceRow?.open_advance_amount || 0),
    open_advance_count: Number(advanceRow?.open_advance_count || 0),
    pending_commission: Number(commissionRow?.pending_commission || 0),
    paid_commission: Number(commissionRow?.paid_commission || 0),
  };
}
