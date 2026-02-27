import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env.js";

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

export function makeUploader(subdir) {
  const dir = path.join(process.cwd(), env.UPLOAD_DIR, subdir);
  ensureDir(dir);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, Date.now() + "_" + safe);
    },
  });
  return multer({ storage });
}
