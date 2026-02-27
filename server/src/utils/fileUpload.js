import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env.js";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function resolveUploadRoot() {
  // Vercel serverless filesystem is read-only except /tmp.
  if (process.env.VERCEL) return "/tmp/uploads";
  if (!env.UPLOAD_DIR) return "/tmp/uploads";
  if (path.isAbsolute(env.UPLOAD_DIR)) return env.UPLOAD_DIR;
  // Keep local behavior configurable but still avoid writing into source dirs by default.
  return path.join("/tmp", env.UPLOAD_DIR);
}

export function makeUploader(subdir) {
  const root = resolveUploadRoot();
  const dir = path.join(root, subdir);
  ensureDir(dir);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        ensureDir(dir);
        cb(null, dir);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, Date.now() + "_" + safe);
    },
  });
  return multer({ storage });
}
