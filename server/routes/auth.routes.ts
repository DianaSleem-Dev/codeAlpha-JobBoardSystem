import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

export default router;