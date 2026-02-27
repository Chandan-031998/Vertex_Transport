import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { loginSchema } from "./auth.validation.js";
import { postLogin, getMe } from "./auth.controller.js";

const r = Router();

r.post("/login", validate(loginSchema), postLogin);
r.get("/me", requireAuth, getMe);

export default r;
