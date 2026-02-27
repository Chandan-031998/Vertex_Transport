import { ok } from "../../utils/response.js";
import * as repo from "./trips.repo.js";

function getDriverScope(req) {
  if (req.user?.role !== "DRIVER") return null;
  if (!req.user?.driver_id) {
    throw Object.assign(new Error("Driver account is not mapped to a driver profile"), { status: 403 });
  }
  return req.user.driver_id;
}

export async function list(req, res, next) {
  try {
    const driverId = getDriverScope(req);
    return ok(res, await repo.listTrips(req.user.company_id, driverId), "Trips");
  }
  catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const driverId = getDriverScope(req);
    const row = await repo.getTrip(req.params.id, req.user.company_id, driverId);
    if (!row) return res.status(404).json({ message: "Trip not found" });
    return ok(res, row, "Trip");
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try { return ok(res, await repo.createTrip(req.user.company_id, req.validated.body), "Trip created"); }
  catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const driverId = getDriverScope(req);
    const payload = { ...req.validated.body };

    if (driverId) {
      const allowed = ["status"];
      const keys = Object.keys(payload);
      const invalidKey = keys.find((k) => !allowed.includes(k));
      if (invalidKey) {
        return res.status(403).json({ message: "Drivers can only update trip status" });
      }
      const allowedStatuses = ["STARTED", "IN_TRANSIT", "DELIVERED", "POD_SUBMITTED"];
      if (!payload.status || !allowedStatuses.includes(payload.status)) {
        return res.status(400).json({ message: "Invalid status update for driver" });
      }
    }

    const row = await repo.updateTrip(req.params.id, req.user.company_id, payload, driverId);
    if (!row) return res.status(404).json({ message: "Trip not found" });
    return ok(res, row, "Trip updated");
  }
  catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try { await repo.deleteTrip(req.params.id, req.user.company_id); return ok(res, true, "Trip deleted"); }
  catch (e) { next(e); }
}

export async function addExpense(req, res, next) {
  try {
    const driverId = getDriverScope(req);
    return ok(res, await repo.addExpense(req.params.id, req.user.company_id, req.validated.body, driverId), "Expense added");
  }
  catch (e) { next(e); }
}

export async function listExpenses(req, res, next) {
  try {
    const driverId = getDriverScope(req);
    return ok(res, await repo.listExpenses(req.params.id, req.user.company_id, driverId), "Trip expenses");
  }
  catch (e) { next(e); }
}

export async function reviewExpense(req, res, next) {
  try {
    if (req.user?.role === "DRIVER") return res.status(403).json({ message: "Drivers cannot review expenses" });
    return ok(res, await repo.reviewExpense(req.params.expenseId, req.validated.body.status, req.user.id), "Expense reviewed");
  }
  catch (e) { next(e); }
}

export async function addPod(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });
    const driverId = getDriverScope(req);
    const row = await repo.addPod(req.params.id, req.user.company_id, req.file.path, driverId);
    return ok(res, row, "POD uploaded");
  } catch (e) { next(e); }
}

export async function listPods(req, res, next) {
  try {
    const driverId = getDriverScope(req);
    return ok(res, await repo.listPods(req.params.id, req.user.company_id, driverId), "PODs");
  }
  catch (e) { next(e); }
}

export async function reviewPod(req, res, next) {
  try {
    if (req.user?.role === "DRIVER") return res.status(403).json({ message: "Drivers cannot review PODs" });
    return ok(res, await repo.reviewPod(req.params.podId, req.validated.body.status, req.user.id), "POD reviewed");
  }
  catch (e) { next(e); }
}
