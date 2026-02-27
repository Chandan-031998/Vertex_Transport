import cors from "cors";
import { env } from "./env.js";

function normalizeOrigin(v) {
  return String(v || "").trim().replace(/\/+$/, "");
}

function parseAllowedOrigins() {
  const defaults = [
    "https://webtransport.vertexsoftware.in",
    "https://vertex-transport.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];
  const fromEnv = String(env.CORS_ORIGINS || "")
    .split(",")
    .map((x) => normalizeOrigin(x))
    .filter(Boolean);
  return new Set([...defaults, ...fromEnv]);
}

const allowed = parseAllowedOrigins();

export function corsMiddleware() {
  return cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/Postman or same-origin
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
