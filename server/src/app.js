// server/src/app.js
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { corsMiddleware } from "./config/cors.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

/**
 * ✅ Trust proxy:
 * - Enable only if behind reverse proxy (Vercel, cPanel proxy, Cloudflare etc.)
 * - Set TRUST_PROXY=1 in env when deploying
 */
if (String(process.env.TRUST_PROXY || "0") === "1") {
  app.set("trust proxy", 1);
}

app.use(helmet());

// ✅ CORS MUST be first
const corsMw = corsMiddleware();
app.use(corsMw);
// Preflight for all routes
app.options("*", corsMw);

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Logger (optional, but good)
app.use(morgan("dev"));

/**
 * ✅ Health check
 * Keep this BEFORE importing routes, so you can test serverless works
 * even if routes/db/env crash.
 */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "vertex-transport-api",
    time: new Date().toISOString(),
    env: process.env.VERCEL ? "vercel" : "local",
  });
});

/**
 * ✅ Lazy-load routes to avoid serverless crash at import time
 * If any route import triggers DB connect/env validation, this prevents boot crash.
 */
app.use("/api", async (req, res, next) => {
  try {
    const { default: routes } = await import("./routes/index.routes.js");
    return routes(req, res, next);
  } catch (err) {
    return next(err);
  }
});

// Errors
app.use(notFound);
app.use(errorHandler);

export default app;