import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { setUploadFolder } from "../middlewares/setUploadFolder.middleware";
const router = Router();
router.post(
  "/createCandidate",
  authMiddleware,
  setUploadFolder("uploads/profiles"),
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  CandidateController.createCandidate,
);
router.get(
  "/getCandidateDetails",
  authMiddleware,
  CandidateController.getCandidateDetails,
);
router.get(
  "/getCandidateById/:id",
  authMiddleware,
  CandidateController.getCandidateById,
);
router.get(
  "/resumes",
  authMiddleware,
  CandidateController.getCandidateResumes,
);
router.put(
  "/updateCandidate",
  authMiddleware,
  setUploadFolder("uploads/profiles"),
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  CandidateController.updateCandidate,
);
router.get(
  "/getAllCandidates",
  authMiddleware,
  CandidateController.getAllCandidates,
);
export default router;
