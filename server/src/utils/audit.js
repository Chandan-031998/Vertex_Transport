import { pool } from "../config/db.js";

export async function writeAuditLog({
  company_id = null,
  actor_user_id = null,
  action,
  module,
  entity = null,
  entity_id = null,
  meta = null,
  ip = null,
  user_agent = null,
}) {
  try {
    await pool.query(
      `INSERT INTO admin_audit_logs
        (company_id, actor_user_id, action, module, entity, entity_id, meta_json, ip, user_agent)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [company_id, actor_user_id, action, module, entity, entity_id, meta ? JSON.stringify(meta) : null, ip, user_agent]
    );
  } catch {
    // audit failures should not break primary flow
  }
}
