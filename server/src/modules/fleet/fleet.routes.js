import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { makeUploader } from "../../utils/fileUpload.js";
import { Permissions } from "../../constants/permissions.js";
import {
  vehicleCreateSchema,
  vehicleUpdateSchema,
  maintenanceCreateSchema,
  tyreCreateSchema,
  tyreMoveSchema,
  tyreReplaceSchema,
  fuelLogCreateSchema,
  breakdownCreateSchema,
  amcCreateSchema,
} from "./fleet.validation.js";
import * as c from "./fleet.controller.js";

const r = Router();
const uploadDocs = makeUploader("vehicle-docs");

r.use(requireAuth);

r.get("/vehicles", requirePermission(Permissions.FLEET_VIEW), c.list);
r.get("/vehicles/:id", requirePermission(Permissions.FLEET_VIEW), c.getOne);
r.post("/vehicles", requirePermission(Permissions.FLEET_MANAGE), validate(vehicleCreateSchema), c.create);
r.put("/vehicles/:id", requirePermission(Permissions.FLEET_MANAGE), validate(vehicleUpdateSchema), c.update);
r.delete("/vehicles/:id", requirePermission(Permissions.FLEET_DELETE), c.remove);

// documents
r.get("/vehicles/:id/documents", requirePermission(Permissions.FLEET_DOCUMENTS_VIEW), c.listDocs);
r.post("/vehicles/:id/documents", requirePermission(Permissions.FLEET_DOCUMENTS_MANAGE),
  uploadDocs.single("file"),
  c.addDoc
);

r.get("/maintenance", requirePermission(Permissions.FLEET_VIEW), c.listMaintenance);
r.post("/maintenance", requirePermission(Permissions.FLEET_MANAGE), validate(maintenanceCreateSchema), c.createMaintenance);

r.get("/tyres", requirePermission(Permissions.FLEET_VIEW), c.listTyres);
r.post("/tyres", requirePermission(Permissions.FLEET_MANAGE), validate(tyreCreateSchema), c.createTyre);
r.post("/tyres/:id/move", requirePermission(Permissions.FLEET_MANAGE), validate(tyreMoveSchema), c.moveTyre);
r.post("/tyres/:id/replace", requirePermission(Permissions.FLEET_MANAGE), validate(tyreReplaceSchema), c.replaceTyre);
r.get("/tyres/:id/history", requirePermission(Permissions.FLEET_VIEW), c.tyreHistory);

r.get("/fuel-logs", requirePermission(Permissions.FLEET_VIEW), c.listFuelLogs);
r.post("/fuel-logs", requirePermission(Permissions.FLEET_MANAGE), validate(fuelLogCreateSchema), c.createFuelLog);
r.get("/fuel-logs/theft-signals", requirePermission(Permissions.FLEET_VIEW), c.fuelTheftSignals);

r.get("/breakdowns", requirePermission(Permissions.FLEET_VIEW), c.listBreakdowns);
r.post("/breakdowns", requirePermission(Permissions.FLEET_MANAGE), validate(breakdownCreateSchema), c.createBreakdown);

r.get("/amc", requirePermission(Permissions.FLEET_VIEW), c.listAmc);
r.post("/amc", requirePermission(Permissions.FLEET_MANAGE), validate(amcCreateSchema), c.createAmc);

r.get("/alerts/expiry", requirePermission(Permissions.FLEET_VIEW), c.expiryAlerts);
r.get("/summary", requirePermission(Permissions.FLEET_VIEW), c.fleetSummary);
r.get("/alerts/document-reminders", requirePermission(Permissions.FLEET_VIEW), c.documentReminderBuckets);

export default r;
