import { ok } from "../../utils/response.js";
import { FleetService } from "./fleet.service.js";

export async function list(req, res, next) {
  try {
    const rows = await FleetService.listVehicles(req.user.company_id);
    return ok(res, rows, "Vehicles");
  } catch (e) {
    next(e);
  }
}

export async function getOne(req, res, next) {
  try {
    const row = await FleetService.getVehicle(req.params.id);
    if (!row) return res.status(404).json({ message: "Vehicle not found" });
    return ok(res, row, "Vehicle");
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const row = await FleetService.createVehicle(req.user.company_id, req.validated.body);
    return ok(res, row, "Vehicle created");
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const row = await FleetService.updateVehicle(req.params.id, req.validated.body);
    return ok(res, row, "Vehicle updated");
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    await FleetService.deleteVehicle(req.params.id);
    return ok(res, true, "Vehicle deleted");
  } catch (e) {
    next(e);
  }
}

export async function listDocs(req, res, next) {
  try {
    const docs = await FleetService.listVehicleDocuments(req.params.id);
    return ok(res, docs, "Vehicle documents");
  } catch (e) {
    next(e);
  }
}

export async function addDoc(req, res, next) {
  try {
    const file = req.file;
    const doc = {
      doc_type: req.body.doc_type,
      doc_no: req.body.doc_no,
      expiry_date: req.body.expiry_date,
      file_path: file ? file.path : null,
    };
    const row = await FleetService.addVehicleDocument(req.params.id, doc);
    return ok(res, row, "Document added");
  } catch (e) {
    next(e);
  }
}

export async function listMaintenance(req, res, next) {
  try {
    const rows = await FleetService.listMaintenanceSchedules(req.user.company_id);
    return ok(res, rows, "Maintenance schedules");
  } catch (e) {
    next(e);
  }
}

export async function createMaintenance(req, res, next) {
  try {
    const row = await FleetService.createMaintenanceSchedule(req.user.company_id, req.validated.body);
    return ok(res, row, "Maintenance schedule created");
  } catch (e) {
    next(e);
  }
}

export async function listTyres(req, res, next) {
  try {
    const rows = await FleetService.listTyres(req.user.company_id);
    return ok(res, rows, "Tyres");
  } catch (e) {
    next(e);
  }
}

export async function createTyre(req, res, next) {
  try {
    const row = await FleetService.createTyre(req.user.company_id, req.validated.body);
    return ok(res, row, "Tyre added");
  } catch (e) {
    next(e);
  }
}

export async function moveTyre(req, res, next) {
  try {
    const row = await FleetService.moveTyre(req.user.company_id, req.params.id, req.validated.body);
    return ok(res, row, "Tyre moved");
  } catch (e) {
    next(e);
  }
}

export async function replaceTyre(req, res, next) {
  try {
    const row = await FleetService.replaceTyre(req.user.company_id, req.params.id, req.validated.body);
    return ok(res, row, "Tyre replaced");
  } catch (e) {
    next(e);
  }
}

export async function tyreHistory(req, res, next) {
  try {
    const rows = await FleetService.listTyreHistory(req.user.company_id, req.params.id);
    return ok(res, rows, "Tyre position history");
  } catch (e) {
    next(e);
  }
}

export async function listFuelLogs(req, res, next) {
  try {
    const rows = await FleetService.listFuelLogs(req.user.company_id);
    return ok(res, rows, "Fuel logs");
  } catch (e) {
    next(e);
  }
}

export async function createFuelLog(req, res, next) {
  try {
    const row = await FleetService.createFuelLog(req.user.company_id, req.validated.body);
    return ok(res, row, "Fuel log added");
  } catch (e) {
    next(e);
  }
}

export async function fuelTheftSignals(req, res, next) {
  try {
    const rows = await FleetService.getFuelTheftSignals(req.user.company_id);
    return ok(res, rows, "Fuel theft signals");
  } catch (e) {
    next(e);
  }
}

export async function listBreakdowns(req, res, next) {
  try {
    const rows = await FleetService.listBreakdowns(req.user.company_id);
    return ok(res, rows, "Breakdowns");
  } catch (e) {
    next(e);
  }
}

export async function createBreakdown(req, res, next) {
  try {
    const row = await FleetService.createBreakdown(req.user.company_id, req.validated.body);
    return ok(res, row, "Breakdown added");
  } catch (e) {
    next(e);
  }
}

export async function listAmc(req, res, next) {
  try {
    const rows = await FleetService.listAmc(req.user.company_id);
    return ok(res, rows, "AMC contracts");
  } catch (e) {
    next(e);
  }
}

export async function createAmc(req, res, next) {
  try {
    const row = await FleetService.createAmc(req.user.company_id, req.validated.body);
    return ok(res, row, "AMC contract added");
  } catch (e) {
    next(e);
  }
}

export async function expiryAlerts(req, res, next) {
  try {
    const days = Number(req.query.days || 30);
    const rows = await FleetService.getVehicleExpiryAlerts(req.user.company_id, Number.isFinite(days) ? days : 30);
    return ok(res, rows, "Vehicle expiry alerts");
  } catch (e) {
    next(e);
  }
}

export async function fleetSummary(req, res, next) {
  try {
    const rows = await FleetService.getFleetSummary(req.user.company_id);
    return ok(res, rows, "Fleet summary");
  } catch (e) {
    next(e);
  }
}

export async function documentReminderBuckets(req, res, next) {
  try {
    const days = String(req.query.days || "30,15,7,1")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    const rows = await FleetService.getVehicleDocumentReminderBuckets(req.user.company_id, days.length ? days : [30, 15, 7, 1]);
    return ok(res, rows, "Document reminder buckets");
  } catch (e) {
    next(e);
  }
}
