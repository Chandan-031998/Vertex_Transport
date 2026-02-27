import cors from "cors";

// ✅ Put your fixed domains here
const allowlist = new Set([
  "https://transport.vertexsoftware.in",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

// ✅ Optional: allow all vercel preview domains for this project
function isAllowedVercel(origin) {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "https:") return false;

    // allow any *.vercel.app (useful for preview + your default vercel domain)
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export function corsMiddleware() {
  return cors({
    origin: (origin, cb) => {
      // allow non-browser tools (curl/postman) where Origin is missing
      if (!origin) return cb(null, true);

      if (allowlist.has(origin)) return cb(null, true);
      if (isAllowedVercel(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`), false);
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"], // optional (for downloads)
    maxAge: 86400, // optional cache for preflight
  });
}