import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ResumeController } from "../controllers/resume.controller";
import { upload } from "../middlewares/upload.middleware";
import { setUploadFolder } from "../middlewares/setUploadFolder.middleware";
const router = Router();
router.post(
  "/uploadResume",
  authMiddleware,
  setUploadFolder("uploads/resumes"),
  upload.single("resume"),
  ResumeController.uploadResume,
);
router.get(
  "/getResumesByCandidateID/:id",
  ResumeController.getResumesByCandidateID,
);
router.delete(
  "/deleteResume/:id",
  authMiddleware,
  ResumeController.deleteResume,
);
router.put(
  "/updateResume/:id",
  authMiddleware,
  setUploadFolder("uploads/resumes"),
  upload.single("resume"),
  ResumeController.updateResume,
);
router.get("/getAllResumes", ResumeController.getAllResumes);
export default router;
