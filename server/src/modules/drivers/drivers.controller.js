import { ok } from "../../utils/response.js";
import * as repo from "./drivers.repo.js";

export async function list(req, res, next) {
  try {
    return ok(res, await repo.listDrivers(req.user.company_id), "Drivers");
  } catch (e) {
    next(e);
  }
}

export async function getOne(req, res, next) {
  try {
    const row = await repo.getDriver(req.params.id);
    if (!row) return res.status(404).json({ message: "Driver not found" });
    return ok(res, row, "Driver");
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    return ok(res, await repo.createDriver(req.user.company_id, req.validated.body), "Driver created");
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    return ok(res, await repo.updateDriver(req.params.id, req.validated.body), "Driver updated");
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    await repo.deleteDriver(req.params.id);
    return ok(res, true, "Driver deleted");
  } catch (e) {
    next(e);
  }
}

export async function uploadPhoto(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "Photo file is required" });
    const row = await repo.updateDriverPhoto(req.user.company_id, req.params.id, req.file.path);
    return ok(res, row, "Driver photo uploaded");
  } catch (e) {
    next(e);
  }
}

export async function listKycDocs(req, res, next) {
  try {
    return ok(res, await repo.listDriverKycDocuments(req.user.company_id, req.params.driverId), "Driver KYC documents");
  } catch (e) {
    next(e);
  }
}

export async function addKycDoc(req, res, next) {
  try {
    const row = await repo.addDriverKycDocument(req.user.company_id, req.params.driverId, {
      doc_type: req.body.doc_type,
      doc_no: req.body.doc_no,
      file_path: req.file ? req.file.path : null,
    });
    return ok(res, row, "KYC document uploaded");
  } catch (e) {
    next(e);
  }
}

export async function updateKycDocStatus(req, res, next) {
  try {
    const row = await repo.updateDriverKycStatus(
      req.user.company_id,
      req.params.driverId,
      req.params.docId,
      req.validated.body,
      req.user.id
    );
    return ok(res, row, "KYC document reviewed");
  } catch (e) {
    next(e);
  }
}

export async function addCompensation(req, res, next) {
  try {
    return ok(res, await repo.addDriverCompensation(req.user.company_id, req.validated.body), "Compensation saved");
  } catch (e) {
    next(e);
  }
}

export async function listCompensation(req, res, next) {
  try {
    return ok(res, await repo.listDriverCompensation(req.user.company_id, req.params.driverId), "Compensation history");
  } catch (e) {
    next(e);
  }
}

export async function addAdvance(req, res, next) {
  try {
    return ok(res, await repo.addDriverAdvance(req.user.company_id, req.validated.body), "Advance added");
  } catch (e) {
    next(e);
  }
}

export async function listAdvances(req, res, next) {
  try {
    return ok(res, await repo.listDriverAdvances(req.user.company_id, req.params.driverId), "Advance history");
  } catch (e) {
    next(e);
  }
}

export async function addSettlement(req, res, next) {
  try {
    return ok(res, await repo.addDriverSettlement(req.user.company_id, req.validated.body), "Settlement created");
  } catch (e) {
    next(e);
  }
}

export async function listSettlements(req, res, next) {
  try {
    return ok(res, await repo.listDriverSettlements(req.user.company_id, req.params.driverId), "Settlement history");
  } catch (e) {
    next(e);
  }
}

export async function calculateCommission(req, res, next) {
  try {
    return ok(res, await repo.calculateTripCommission(req.user.company_id, req.validated.body), "Trip commission calculated");
  } catch (e) {
    next(e);
  }
}

export async function listCommissions(req, res, next) {
  try {
    return ok(res, await repo.listDriverCommissions(req.user.company_id, req.params.driverId), "Commission history");
  } catch (e) {
    next(e);
  }
}

export async function upsertAttendance(req, res, next) {
  try {
    return ok(res, await repo.upsertDriverAttendance(req.user.company_id, req.validated.body), "Attendance saved");
  } catch (e) {
    next(e);
  }
}

export async function listAttendance(req, res, next) {
  try {
    return ok(res, await repo.listDriverAttendance(req.user.company_id, req.params.driverId), "Attendance history");
  } catch (e) {
    next(e);
  }
}

export async function generatePerformance(req, res, next) {
  try {
    return ok(res, await repo.generateDriverPerformance(req.user.company_id, req.validated.body), "Performance score generated");
  } catch (e) {
    next(e);
  }
}

export async function listPerformance(req, res, next) {
  try {
    return ok(res, await repo.listDriverPerformance(req.user.company_id, req.params.driverId), "Performance history");
  } catch (e) {
    next(e);
  }
}

export async function upsertStatutory(req, res, next) {
  try {
    return ok(res, await repo.upsertDriverStatutory(req.user.company_id, req.validated.body), "ESI/PF saved");
  } catch (e) {
    next(e);
  }
}

export async function getStatutory(req, res, next) {
  try {
    return ok(res, await repo.getDriverStatutory(req.user.company_id, req.params.driverId), "ESI/PF");
  } catch (e) {
    next(e);
  }
}

export async function licenseExpiryAlerts(req, res, next) {
  try {
    const days = Number(req.query.days || 30);
    return ok(
      res,
      await repo.getDriverLicenseExpiryAlerts(req.user.company_id, Number.isFinite(days) ? days : 30),
      "Driver license expiry alerts"
    );
  } catch (e) {
    next(e);
  }
}

export async function performanceOverview(req, res, next) {
  try {
    return ok(res, await repo.getDriverPerformanceOverview(req.user.company_id), "Driver performance overview");
  } catch (e) {
    next(e);
  }
}

export async function mySettlementSummary(req, res, next) {
  try {
    if (req.user?.role !== "DRIVER") return res.status(403).json({ message: "Driver role required" });
    if (!req.user?.driver_id) {
      return res.status(403).json({ message: "Driver account is not mapped to a driver profile" });
    }
    return ok(
      res,
      await repo.getDriverSettlementSummary(req.user.company_id, req.user.driver_id),
      "Driver settlement summary"
    );
  } catch (e) {
    next(e);
  }
}
