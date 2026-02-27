import app from "./app.js";
import { env } from "./config/env.js";
import { pingDb } from "./config/db.js";

// Trust proxy (needed behind cPanel / reverse proxy / some deployments)
if (String(env.TRUST_PROXY || "0") === "1") app.set("trust proxy", 1);

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  let dbOk = false;
  try {
    dbOk = await pingDb();
  } catch {
    dbOk = false;
  }

  console.log(`Server running on port ${PORT}`);
  console.log(`DB connected: ${dbOk ? "YES" : "NO (check DB_* envs)"}`);
});
