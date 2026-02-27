import cors from "cors";

const allowed = new Set([
  "https://transport.vertexsoftware.in",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

// allow vercel preview domains if needed
const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;

export function corsMiddleware() {
  return cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Postman/curl

      if (allowed.has(origin)) return cb(null, true);
      if (vercelPreviewRegex.test(origin)) return cb(null, true);

      return cb(null, false); // IMPORTANT: don't throw Error (it breaks preflight)
    },
    credentials: false, // set true ONLY if you use cookies/sessions
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  });
}