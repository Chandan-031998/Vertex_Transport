import { pool } from "../../config/db.js";
import { ok } from "../../utils/response.js";

function dateRange(period) {
  if (period === "week") return "DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
  if (period === "month") return "DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
  return "DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
}

export async function getDashboard(req, res, next) {
  try {
    const period = String(req.query.period || "week");
    const fromExpr = dateRange(period);
    const companyId = req.user.company_id;

    const [fleetRows] = await pool.query(
      `SELECT t.vehicle_id, v.vehicle_no, COUNT(*) AS trip_count
       FROM trips t
       JOIN vehicles v ON v.id=t.vehicle_id
       WHERE (t.company_id=? OR ? IS NULL)
         AND t.start_date >= ${fromExpr}
       GROUP BY t.vehicle_id, v.vehicle_no
       ORDER BY trip_count DESC`,
      [companyId, companyId]
    );

    const [tripRows] = await pool.query(
      `SELECT COUNT(*) AS total_trips,
              SUM(CASE WHEN status IN ('DELIVERED','POD_SUBMITTED','CLOSED','SETTLED') THEN 1 ELSE 0 END) AS delivered_trips
       FROM trips
       WHERE (company_id=? OR ? IS NULL)
         AND start_date >= ${fromExpr}`,
      [companyId, companyId]
    );

    const [expenseRows] = await pool.query(
      `SELECT expense_type, SUM(amount) AS total_amount
       FROM trip_expenses te
       JOIN trips t ON t.id=te.trip_id
       WHERE (t.company_id=? OR ? IS NULL)
         AND t.start_date >= ${fromExpr}
       GROUP BY expense_type`,
      [companyId, companyId]
    );

    const [outstandingRows] = await pool.query(
      `SELECT COUNT(*) AS count_items, SUM(total-amount_paid) AS total_outstanding
       FROM invoices
       WHERE (company_id=? OR ? IS NULL)
         AND (total-amount_paid)>0`,
      [companyId, companyId]
    );

    return ok(res, {
      period,
      fleet_utilization: fleetRows,
      trips_summary: tripRows?.[0] || {},
      expense_totals: expenseRows,
      outstanding: outstandingRows?.[0] || {},
    }, "Reports dashboard");
  } catch (e) {
    next(e);
  }
}

export async function driverTripCount(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const [rows] = await pool.query(
      `SELECT d.id, d.name, COUNT(t.id) AS trip_count
       FROM drivers d
       LEFT JOIN trips t ON t.driver_id=d.id
       WHERE d.company_id=? OR ? IS NULL
       GROUP BY d.id, d.name
       ORDER BY trip_count DESC`,
      [companyId, companyId]
    );
    return ok(res, rows, "Driver trip count");
  } catch (e) {
    next(e);
  }
}
