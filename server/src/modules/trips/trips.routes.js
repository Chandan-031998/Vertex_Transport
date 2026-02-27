import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { makeUploader } from "../../utils/fileUpload.js";
import { Permissions } from "../../constants/permissions.js";
import { tripCreateSchema, tripUpdateSchema, expenseCreateSchema, reviewStatusSchema } from "./trips.validation.js";
import * as c from "./trips.controller.js";

const r = Router();
const uploadPod = makeUploader("pod");

r.use(requireAuth);

r.get("/", requirePermission(Permissions.TRIPS_VIEW), c.list);
r.get("/:id", requirePermission(Permissions.TRIPS_VIEW), c.getOne);
r.post("/", requirePermission(Permissions.TRIPS_MANAGE), validate(tripCreateSchema), c.create);
r.put("/:id", requirePermission(Permissions.TRIPS_MANAGE, Permissions.TRIPS_STATUS_UPDATE), validate(tripUpdateSchema), c.update);
r.delete("/:id", requirePermission(Permissions.TRIPS_DELETE), c.remove);

r.get("/:id/expenses", requirePermission(Permissions.TRIPS_EXPENSES_VIEW), c.listExpenses);
r.post("/:id/expenses", requirePermission(Permissions.TRIPS_EXPENSES_MANAGE), validate(expenseCreateSchema), c.addExpense);
r.put("/:id/expenses/:expenseId/review", requirePermission(Permissions.TRIPS_EXPENSES_VIEW), validate(reviewStatusSchema), c.reviewExpense);

r.get("/:id/pods", requirePermission(Permissions.TRIPS_PODS_VIEW), c.listPods);
r.post("/:id/pods", requirePermission(Permissions.TRIPS_PODS_MANAGE), uploadPod.single("file"), c.addPod);
r.put("/:id/pods/:podId/review", requirePermission(Permissions.TRIPS_PODS_VIEW), validate(reviewStatusSchema), c.reviewPod);

export default r;
