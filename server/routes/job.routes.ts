import { Router } from "express";
import { JobController } from "../controllers/job.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/createJob",authMiddleware, JobController.createJob);
router.get("/getAllJobs", authMiddleware,JobController.getAllJobs);
router.get("/getJobById/:id", authMiddleware,JobController.getJobById);
router.put("/updateJob/:id", authMiddleware, JobController.updateJob);
router.delete("/deleteJob/:id", authMiddleware, JobController.deleteJob);
router.get("/company-jobs", authMiddleware, JobController.getCompanyJobs);
export default router;