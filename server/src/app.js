import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsMiddleware } from "./config/cors.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

import routes from "./routes/index.routes.js";

const app = express();

app.use(helmet());
app.use(corsMiddleware());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
