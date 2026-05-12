import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { StatsController } from "../controllers/stats.controller";
const router = Router();
router.get("/getStatistics", authMiddleware, StatsController.getStatistics);
export default router;
