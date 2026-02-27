import cors from "cors";

export function corsMiddleware() {
  return cors({
    origin: true,
    credentials: true,
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"],
    exposedHeaders: ["Content-Disposition"],
  });
}
