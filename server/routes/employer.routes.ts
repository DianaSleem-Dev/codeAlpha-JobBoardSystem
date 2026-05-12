import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { EmployerController } from "../controllers/employer.controller";
import { upload } from "../middlewares/upload.middleware";
import { setUploadFolder } from "../middlewares/setUploadFolder.middleware";
const router = Router();
router.post(
  "/createEmployer",
  authMiddleware,
  setUploadFolder("uploads/profiles"),
  upload.single("logo"),
  EmployerController.createEmployer,
);
router.get(
  "/getEmployerDetails",
  authMiddleware,
  EmployerController.getEmployerDetails,
);
router.get(
 "/getEmployerById/:id",
  authMiddleware,
  EmployerController.getEmployerById,
);
router.put(
  "/updateEmployer",
  authMiddleware,
  setUploadFolder("uploads/profiles"),
  upload.single("logo"),
  EmployerController.updateEmployer,
);
router.get(
  "/getAllEmployers",
  authMiddleware,
  EmployerController.getAllEmployers,
);
export default router;
