import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";
import { Permissions } from "../../constants/permissions.js";
import * as c from "./reports.controller.js";

const r = Router();
r.use(requireAuth);

r.get("/dashboard", requirePermission(Permissions.REPORTS_VIEW), c.getDashboard);
r.get("/driver-trip-count", requirePermission(Permissions.REPORTS_VIEW), c.driverTripCount);

export default r;
