import app from "./app.js";
import { env } from "./config/env.js";
import { pingDb } from "./config/db.js";

if (String(env.TRUST_PROXY || "0") === "1") app.set("trust proxy", 1);

app.listen(env.PORT, async () => {
  let dbOk = false;
  try { dbOk = await pingDb(); } catch (e) { dbOk = false; }
  console.log(`✅ Server running: http://localhost:${env.PORT}`);
  console.log(`✅ DB connected: ${dbOk ? "YES" : "NO (check .env + MySQL)"}`);
});
