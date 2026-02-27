import app from "./app.js";
import { env } from "./config/env.js";
import { pingDb } from "./config/db.js";

// Trust proxy (Render/Reverse proxy)
if (String(env.TRUST_PROXY || "0") === "1") {
  app.set("trust proxy", 1);
}

const PORT = Number(process.env.PORT || 4000);

const server = app.listen(PORT, "0.0.0.0", async () => {
  let dbOk = false;
  try {
    dbOk = await pingDb();
  } catch {
    dbOk = false;
  }

  console.log(`Server running on port ${PORT}`);
  console.log(`DB connected: ${dbOk ? "YES" : "NO (check DB_* envs)"}`);
});

// Graceful shutdown (Render sends SIGTERM)
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => process.exit(0));
});
