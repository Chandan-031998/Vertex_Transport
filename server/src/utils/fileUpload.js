import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env.js";

function ensureDir(p) {
  try {
    fs.mkdirSync(p, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function resolveUploadRoot() {
  const configured = String(env.UPLOAD_DIR || "uploads");
  const primary = path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
  if (ensureDir(primary)) return primary;
  const fallback = "/tmp/uploads";
  ensureDir(fallback);
  return fallback;
}

export function makeUploader(subdir) {
  const root = resolveUploadRoot();
  const dir = path.join(root, subdir);
  if (!ensureDir(dir)) {
    const fallbackDir = path.join("/tmp/uploads", subdir);
    ensureDir(fallbackDir);
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        if (ensureDir(dir)) return cb(null, dir);
        const fallbackDir = path.join("/tmp/uploads", subdir);
        ensureDir(fallbackDir);
        return cb(null, fallbackDir);
      } catch (err) {
        return cb(err);
      }
    },
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, Date.now() + "_" + safe);
    },
  });
  return multer({
    storage,
    limits: { fileSize: Number(env.MAX_UPLOAD_MB || 10) * 1024 * 1024 },
  });
}
