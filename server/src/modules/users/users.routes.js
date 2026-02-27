import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { Permissions } from "../../constants/permissions.js";
import { userCreateSchema, userUpdateSchema, resetPasswordSchema } from "./users.validation.js";
import * as c from "./users.controller.js";

const r = Router();

r.use(requireAuth);

r.get("/", requirePermission(Permissions.USERS_VIEW, Permissions.USERS_MANAGE), c.listUsers);
r.get("/login-activity", requirePermission(Permissions.USERS_VIEW, Permissions.AUDIT_VIEW), c.listLoginActivity);
r.get("/audit-logs", requirePermission(Permissions.AUDIT_VIEW), c.listAuditLogs);
r.get("/:id", requirePermission(Permissions.USERS_VIEW, Permissions.USERS_MANAGE), c.getUser);
r.post("/", requirePermission(Permissions.USERS_MANAGE), validate(userCreateSchema), c.createUser);
r.put("/:id", requirePermission(Permissions.USERS_MANAGE), validate(userUpdateSchema), c.updateUser);
r.post(
  "/:id/reset-password",
  requirePermission(Permissions.USERS_RESET_PASSWORD, Permissions.USERS_MANAGE),
  validate(resetPasswordSchema),
  c.resetPassword
);
r.delete("/:id", requirePermission(Permissions.USERS_MANAGE), c.deleteUser);

export default r;
