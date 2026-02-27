// /api/index.js
import app from "../server/src/app.js";

// Vercel serverless handler
export default function handler(req, res) {
  return app(req, res);
}