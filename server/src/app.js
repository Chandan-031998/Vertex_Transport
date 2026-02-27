import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { corsMiddleware } from "./config/cors.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import routes from "./routes/index.routes.js";

const app = express();

// If behind a reverse proxy (cPanel, nginx), keep this.
// If not needed, it doesn't break.
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// ✅ CORS must come before routes
const cors = corsMiddleware();
app.use(cors);

// ✅ IMPORTANT: handle preflight requests (always before routes)
app.options("*", cors);

// Body parsers
app.use(express.json({ limit: "10mb" })); // increased a bit for uploads
app.use(express.urlencoded({ extended: true }));

// Logs
app.use(morgan("dev"));

// Health check (quick test)
app.get("/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/api", routes);

// Errors
app.use(notFound);
app.use(errorHandler);

export default app;