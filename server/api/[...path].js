import serverless from "serverless-http";
import app from "../src/app.js";

const handler = serverless(app);

export default function serverVercelCatchAll(req, res) {
  return handler(req, res);
}
