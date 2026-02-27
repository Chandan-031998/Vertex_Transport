import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { corsMiddleware } from "./config/cors.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import routes from "./routes/index.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

// CORS first
const corsMw = corsMiddleware();
app.use(corsMw);
app.options("*", corsMw);

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// Health
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "vertex-transport-api", time: new Date().toISOString() });
});

// Routes
app.use("/api", routes);

// Errors
app.use(notFound);
app.use(errorHandler);

export default app;