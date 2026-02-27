import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { Permissions } from "../../constants/permissions.js";
import { makeUploader } from "../../utils/fileUpload.js";
import {
  driverCreateSchema,
  driverUpdateSchema,
  kycStatusUpdateSchema,
  compensationCreateSchema,
  advanceCreateSchema,
  settlementCreateSchema,
  commissionCalculateSchema,
  attendanceUpsertSchema,
  performanceGenerateSchema,
  statutoryUpsertSchema,
} from "./drivers.validation.js";
import * as c from "./drivers.controller.js";

const r = Router();
const uploadDriverKyc = makeUploader("driver-kyc");
const uploadDriverPhoto = makeUploader("driver-photo");
r.use(requireAuth);

r.get("/me/settlements/summary", requirePermission(Permissions.DRIVER_SETTLEMENTS_VIEW), c.mySettlementSummary);
r.get("/alerts/license-expiry", requirePermission(Permissions.DRIVERS_VIEW), c.licenseExpiryAlerts);
r.get("/overview/performance", requirePermission(Permissions.DRIVERS_VIEW), c.performanceOverview);

r.get("/", requirePermission(Permissions.DRIVERS_VIEW), c.list);
r.get("/:id", requirePermission(Permissions.DRIVERS_VIEW), c.getOne);
r.post("/", requirePermission(Permissions.DRIVERS_MANAGE), validate(driverCreateSchema), c.create);
r.put("/:id", requirePermission(Permissions.DRIVERS_MANAGE), validate(driverUpdateSchema), c.update);
r.post("/:id/photo", requirePermission(Permissions.DRIVERS_MANAGE), uploadDriverPhoto.single("file"), c.uploadPhoto);
r.delete("/:id", requirePermission(Permissions.DRIVERS_DELETE), c.remove);

r.get("/:driverId(\\d+)/kyc-documents", requirePermission(Permissions.DRIVERS_VIEW), c.listKycDocs);
r.post(
  "/:driverId(\\d+)/kyc-documents",
  requirePermission(Permissions.DRIVERS_MANAGE),
  uploadDriverKyc.single("file"),
  c.addKycDoc
);
r.put(
  "/:driverId(\\d+)/kyc-documents/:docId(\\d+)/status",
  requirePermission(Permissions.DRIVERS_MANAGE),
  validate(kycStatusUpdateSchema),
  c.updateKycDocStatus
);

r.get("/:driverId(\\d+)/compensation", requirePermission(Permissions.DRIVERS_VIEW), c.listCompensation);
r.post("/compensation", requirePermission(Permissions.DRIVERS_MANAGE), validate(compensationCreateSchema), c.addCompensation);

r.get("/:driverId(\\d+)/advances", requirePermission(Permissions.DRIVERS_VIEW), c.listAdvances);
r.post("/advances", requirePermission(Permissions.DRIVERS_MANAGE), validate(advanceCreateSchema), c.addAdvance);
r.get("/:driverId(\\d+)/settlements", requirePermission(Permissions.DRIVERS_VIEW), c.listSettlements);
r.post("/settlements", requirePermission(Permissions.DRIVERS_MANAGE), validate(settlementCreateSchema), c.addSettlement);

r.get("/:driverId(\\d+)/commissions", requirePermission(Permissions.DRIVERS_VIEW), c.listCommissions);
r.post("/commissions/calculate", requirePermission(Permissions.DRIVERS_MANAGE), validate(commissionCalculateSchema), c.calculateCommission);

r.get("/:driverId(\\d+)/attendance", requirePermission(Permissions.DRIVERS_VIEW), c.listAttendance);
r.post("/attendance", requirePermission(Permissions.DRIVERS_MANAGE), validate(attendanceUpsertSchema), c.upsertAttendance);

r.get("/:driverId(\\d+)/performance", requirePermission(Permissions.DRIVERS_VIEW), c.listPerformance);
r.post("/performance/generate", requirePermission(Permissions.DRIVERS_MANAGE), validate(performanceGenerateSchema), c.generatePerformance);

r.get("/:driverId(\\d+)/statutory", requirePermission(Permissions.DRIVERS_VIEW), c.getStatutory);
r.post("/statutory", requirePermission(Permissions.DRIVERS_MANAGE), validate(statutoryUpsertSchema), c.upsertStatutory);

export default r;
