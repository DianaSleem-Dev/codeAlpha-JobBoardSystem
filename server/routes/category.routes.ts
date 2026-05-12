import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();

/**
 * Create category
 */
router.post("/createCategory", CategoryController.createCategory);

/**
 * Get all categories
 */
router.get("/getAllCategories", CategoryController.getAllCategories);

/**
 * Get category by id
 */
router.get("/getCategoryById/:id", CategoryController.getCategoryById);

/**
 * Update category
 */
router.put("/updateCategory/:id", CategoryController.updateCategory);

export default router;