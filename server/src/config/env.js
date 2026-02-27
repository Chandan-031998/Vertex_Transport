import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 4000),
  TRUST_PROXY: String(process.env.TRUST_PROXY || "0"),
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "vertex_transport_manager",
  JWT_SECRET: process.env.JWT_SECRET || "change_me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  // Runtime upload path: use /tmp for serverless compatibility.
  UPLOAD_DIR: process.env.UPLOAD_DIR || "/tmp/uploads",
};
