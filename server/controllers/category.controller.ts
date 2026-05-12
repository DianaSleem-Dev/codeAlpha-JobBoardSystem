import { Request, Response } from "express";
import { createErrorResponse } from "../helpers/createErrorResponse";
import { createSuccessResponse } from "../helpers/createSuccessResponse";
import { CreateCategoryRequestDto } from "../dtos/category/create-category.request.dto";
import { UpdateCategoryRequestDto } from "../dtos/category/update-category.request.dto";
import { Category } from "../models/category.model";


export class CategoryController {

  /**
   * @swagger
   * /category/createCategory:
   *   post:
   *     summary: Create category
   *     tags: [Category]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateCategoryRequestDto'
   *     responses:
   *       201:
   *         description: Category created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/CategoryResponseDto'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDto'
   *       500:
   *         description: Server error
   */
  static async createCategory(req: Request, res: Response) {
    try {
      const dto: CreateCategoryRequestDto = req.body;

      if (!dto.name) {
        return res.status(400).json(createErrorResponse("Name is required"));
      }

       await Category.create({
        name: dto.name,
        description: dto.description,
      });

      return res.status(201).json(
        createSuccessResponse(
          "Category created successfully"
        )
      );
    } catch (err: unknown) {
      console.error(err);
      return res.status(500).json(createErrorResponse("Internal server error"));
    }
  }

  /**
   * @swagger
   * /category/getAllCategories:
   *   get:
   *     summary: Get all categories
   *     tags: [Category]
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/CategoryResponseDto'
   *       500:
   *         description: Server error
   */
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await Category.find({}, "name description").lean();

      return res
        .status(200)
        .json(createSuccessResponse(categories, "Success"));
    } catch (err: unknown) {
      console.error(err);
      return res.status(500).json(createErrorResponse("Internal server error"));
    }
  }

  /**
   * @swagger
   * /category/getCategoryById/{id}:
   *   get:
   *     summary: Get category by id
   *     tags: [Category]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/CategoryResponseDto'
   *       400:
   *         description: Invalid ID
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDto'
   *       404:
   *         description: Category not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDto'
   */
  static async getCategoryById(req: Request, res: Response) {
    try {
      const categoryId = req.params.id;

      const category = await Category.findById(categoryId,"name description").lean();

      if (!category) {
        return res.status(404).json(createErrorResponse("Category not found"));
      }

      return res
        .status(200)
        .json(createSuccessResponse(category, "Success"));
    } catch (err: unknown) {
      console.error(err);
      return res.status(400).json(createErrorResponse("Invalid ID"));
    }
  }

  /**
   * @swagger
   * /category/updateCategory/{id}:
   *   put:
   *     summary: Update category
   *     tags: [Category]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateCategoryRequestDto'
   *     responses:
   *       200:
   *         description: Updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/CategoryResponseDto'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDto'
   *       404:
   *         description: Category not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDto'
   */
  static async updateCategory(req: Request, res: Response) {
    try {
      const categoryId = req.params.id;
      const dto: UpdateCategoryRequestDto = req.body;

      const existing = await Category.findById(categoryId);

      if (!existing) {
        return res.status(404).json(createErrorResponse("Category not found"));
      }

      if (!dto.name && !dto.description) {
        return res.status(400).json(createErrorResponse("No data to update"));
      }

      existing.name = dto.name ?? existing.name;
      existing.description = dto.description ?? existing.description;

      await existing.save();

      return res.status(200).json(
        createSuccessResponse(
          existing,
          "Category updated successfully"
        )
      );
    } catch (err: unknown) {
      console.error(err);
      return res.status(400).json(createErrorResponse("Invalid ID"));
    }
  }
}