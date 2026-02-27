import app from "./app.js";
import { env } from "./config/env.js";
import { pingDb } from "./config/db.js";

// Trust proxy (Render / reverse proxies)
if (String(env.TRUST_PROXY || process.env.TRUST_PROXY || "0") === "1") {
  app.set("trust proxy", 1);
}

// ✅ Render sets PORT automatically
const PORT = Number(process.env.PORT || env.PORT || 4000);

app.listen(PORT, async () => {
  let dbOk = false;
  try {
    dbOk = await pingDb();
  } catch {
    dbOk = false;
  }

  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || env.NODE_ENV || "unknown"}`);
  console.log(`✅ DB connected: ${dbOk ? "YES" : "NO (check DB_* envs)"}`);
});

// Graceful shutdown (optional but good)
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down...");
  process.exit(0);
});