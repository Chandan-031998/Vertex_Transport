import { login } from "./auth.service.js";
import { ok } from "../../utils/response.js";
import { writeAuditLog } from "../../utils/audit.js";

export async function postLogin(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const data = await login(email, password);
    await writeAuditLog({
      company_id: data.user?.company_id || null,
      actor_user_id: data.user?.id || null,
      action: "LOGIN_SUCCESS",
      module: "auth",
      entity: "users",
      entity_id: String(data.user?.id || ""),
      meta: { email: data.user?.email },
      ip: req.ip,
      user_agent: req.headers["user-agent"] || null,
    });
    return ok(res, data, "Login success");
  } catch (e) {
    next(e);
  }
}

export async function getMe(req, res) {
  return ok(res, { user: req.user }, "Me");
}
