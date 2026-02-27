import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { corsMiddleware } from "./config/cors.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import routes from "./routes/index.routes.js";

const app = express();

// Security headers
app.use(helmet());

// ✅ CORS must come before routes
app.use(corsMiddleware());

// ✅ IMPORTANT: handle preflight requests
app.options("*", corsMiddleware());

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Logs
app.use(morgan("dev"));

// Routes
app.use("/api", routes);

// Errors
app.use(notFound);
app.use(errorHandler);

export default app;