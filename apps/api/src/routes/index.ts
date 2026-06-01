import { Router } from "express";
import { healthRoutes } from "./health.routes.js";
import { eventsRoutes } from "./events.routes.js";
import { locationsRoutes } from "./locations.routes.js";

const router = Router();

// Mount sub-routers
router.use("/health", healthRoutes);
router.use("/events", eventsRoutes);
router.use("/locations", locationsRoutes);

export const apiRouter = router;
