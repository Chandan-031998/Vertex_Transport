import serverless from "serverless-http";
import app from "../src/app.js";

const handler = serverless(app);

export default function serverVercelHandler(req, res) {
  return handler(req, res);
}
