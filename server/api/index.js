// if Root Directory = server, then file path becomes: server/api/index.js
import app from "./src/app.js";

export default function handler(req, res) {
  return app(req, res);
}