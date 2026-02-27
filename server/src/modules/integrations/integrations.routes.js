import { Router } from "express";
const r = Router();
r.all("*", (req, res) => res.status(501).json({ message: "Phase-2 module placeholder. Implement in this folder." }));
export default r;
