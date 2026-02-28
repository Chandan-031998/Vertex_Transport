import cors from "cors";
import { env } from "./env.js";

export function corsMiddleware() {
  const allowed = [
    "http://webtransport.vertexsoftware.in",
    "https://webtransport.vertexsoftware.in",
    "http://transport.vertexsoftware.in",
    "https://transport.vertexsoftware.in",
  ];

  // allow localhost in dev
  if (env.NODE_ENV !== "production") {
    allowed.push("http://localhost:5173", "http://localhost:3000");
  }

  return cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // allow server-to-server / curl
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin), false);
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}