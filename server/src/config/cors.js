import cors from "cors";

const allowedOrigins = [
  "https://transport.vertexsoftware.in",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export function corsMiddleware() {
  return cors({
    origin: (origin, cb) => {
      // allow non-browser tools (postman, curl)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}