import { Router } from "express";
import { healthRoutes } from "./health.routes";
import { eventsRoutes } from "../events/events.routes";
import { locationsRoutes } from "./locations.routes";

const router = Router();

// Mount sub-routers
router.use("/health", healthRoutes);
router.use("/events", eventsRoutes);
router.use("/locations", locationsRoutes);

export const apiRouter = router;
