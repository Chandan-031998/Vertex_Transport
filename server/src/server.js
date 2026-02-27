import app from "./app.js";
import { env } from "./config/env.js";
import { pingDb } from "./config/db.js";

// Trust proxy (needed behind cPanel / reverse proxy / some deployments)
if (String(env.TRUST_PROXY || "0") === "1") app.set("trust proxy", 1);

// ✅ Vercel runs as Serverless Function.
// If we call app.listen() on Vercel, it can break deployment.
// So: only listen when NOT running on Vercel.
const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  const PORT = Number(env.PORT || 4000);

  app.listen(PORT, async () => {
    let dbOk = false;
    try {
      dbOk = await pingDb();
    } catch (e) {
      dbOk = false;
    }

    console.log(`✅ Server running: http://localhost:${PORT}`);
    console.log(`✅ DB connected: ${dbOk ? "YES" : "NO (check .env + MySQL)"}`);
  });
}

// ✅ Export app for serverless usage (Vercel api/index.js will import and run it)
export default app;