import cors from "cors";
import { env } from "./env.js";

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function parseAllowedOrigins() {
  const defaults = [
    "https://webtransport.vertexsoftware.in",
    "https://transport.vertexsoftware.in",
    "https://vertex-transport.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];

  const fromEnv = String(env.CORS_ORIGINS || "")
    .split(",")
    .map((item) => normalizeOrigin(item))
    .filter(Boolean);

  return new Set([...defaults, ...fromEnv]);
}

export function corsMiddleware() {
  const allowed = parseAllowedOrigins();

  return cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // allow server-to-server / curl
      const normalized = normalizeOrigin(origin);
      if (allowed.has(normalized)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  });
}
