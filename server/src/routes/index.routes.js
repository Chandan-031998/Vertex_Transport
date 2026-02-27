import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import fleetRoutes from "../modules/fleet/fleet.routes.js";
import driversRoutes from "../modules/drivers/drivers.routes.js";
import tripsRoutes from "../modules/trips/trips.routes.js";
import billingRoutes from "../modules/billing/billing.routes.js";
import rolesRoutes from "../modules/roles/roles.routes.js";
import usersRoutes from "../modules/users/users.routes.js";
import settingsRoutes from "../modules/settings/settings.routes.js";
import reportsRoutes from "../modules/reports/reports.routes.js";

import trackingRoutes from "../modules/tracking/tracking.routes.js";
import vendorsRoutes from "../modules/vendors/vendors.routes.js";
import brokersRoutes from "../modules/brokers/brokers.routes.js";
import complianceRoutes from "../modules/compliance/compliance.routes.js";
import integrationsRoutes from "../modules/integrations/integrations.routes.js";

const r = Router();

r.get("/health", (req, res) => res.json({ ok: true, name: "Vertex Transport Manager API" }));

r.use("/auth", authRoutes);
r.use("/fleet", fleetRoutes);
r.use("/drivers", driversRoutes);
r.use("/trips", tripsRoutes);
r.use("/billing", billingRoutes);
r.use("/roles", rolesRoutes);
r.use("/users", usersRoutes);
r.use("/settings", settingsRoutes);
r.use("/reports", reportsRoutes);

// Phase-2 placeholders (return 501 for now)
r.use("/tracking", trackingRoutes);
r.use("/vendors", vendorsRoutes);
r.use("/brokers", brokersRoutes);
r.use("/compliance", complianceRoutes);
r.use("/integrations", integrationsRoutes);

export default r;
