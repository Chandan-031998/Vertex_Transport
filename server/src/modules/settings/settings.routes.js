import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { Permissions } from "../../constants/permissions.js";
import {
  updateCompanySettingsSchema,
  branchCreateSchema,
  branchUpdateSchema,
} from "./settings.validation.js";
import * as c from "./settings.controller.js";

const r = Router();

r.use(requireAuth);

r.get("/theme", c.getThemeSettings);

r.get("/company", requirePermission(Permissions.SETTINGS_VIEW, Permissions.SETTINGS_MANAGE), c.getCompanySettings);
r.put(
  "/company",
  requirePermission(Permissions.SETTINGS_MANAGE),
  validate(updateCompanySettingsSchema),
  c.updateCompanySettings
);
r.get("/branches", requirePermission(Permissions.SETTINGS_VIEW, Permissions.BRANCHES_MANAGE), c.listBranches);
r.post("/branches", requirePermission(Permissions.BRANCHES_MANAGE, Permissions.SETTINGS_MANAGE), validate(branchCreateSchema), c.createBranch);
r.put("/branches/:id", requirePermission(Permissions.BRANCHES_MANAGE, Permissions.SETTINGS_MANAGE), validate(branchUpdateSchema), c.updateBranch);
r.delete("/branches/:id", requirePermission(Permissions.BRANCHES_MANAGE, Permissions.SETTINGS_MANAGE), c.deleteBranch);

r.get(
  "/export/:entity",
  requirePermission(Permissions.SETTINGS_MANAGE, Permissions.BILLING_EXPORT),
  c.exportMasterData
);

export default r;
