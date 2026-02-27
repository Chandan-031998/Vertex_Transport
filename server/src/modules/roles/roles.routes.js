import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { Permissions } from "../../constants/permissions.js";
import { roleCreateSchema, roleUpdateSchema } from "./roles.validation.js";
import * as c from "./roles.controller.js";

const r = Router();

r.use(requireAuth);

r.get("/permissions", requirePermission(Permissions.ROLES_VIEW, Permissions.ROLES_MANAGE), c.listPermissions);
r.get("/", requirePermission(Permissions.ROLES_VIEW, Permissions.ROLES_MANAGE), c.listRoles);
r.get("/:id", requirePermission(Permissions.ROLES_VIEW, Permissions.ROLES_MANAGE), c.getRole);
r.post("/", requirePermission(Permissions.ROLES_MANAGE), validate(roleCreateSchema), c.createRole);
r.put("/:id", requirePermission(Permissions.ROLES_MANAGE), validate(roleUpdateSchema), c.updateRole);
r.delete("/:id", requirePermission(Permissions.ROLES_MANAGE), c.deleteRole);

export default r;
