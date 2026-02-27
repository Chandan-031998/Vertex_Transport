import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getUserByIdWithPermissions } from "../modules/auth/auth.service.js";

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await getUserByIdWithPermissions(payload.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.status !== "ACTIVE") return res.status(403).json({ message: "Account inactive" });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}
