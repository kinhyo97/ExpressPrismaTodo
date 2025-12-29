import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category.service";
import { logger } from "../utils/logger";
import {
  validateCategoryId,
  validateCategoryName,
  validateCategoryNameLength,
  validateCategoryColor,
} from "../validation/todo/category.validation";

/** CREATE */
export const createCategory = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name, color } = req.body;

  logger.info(`Creating category for user ${userId}`);

  validateCategoryName(name);
  validateCategoryNameLength(name);
  validateCategoryColor(color);

  const category = await categoryService.createCategory(
    userId,
    name,
    color
  );

  res.status(201).json(category);
};

/** READ */
export const getCategories = async (req: Request, res: Response) => {
    console.log("get Categories controller");
  const userId = req.user!.id;

  logger.info(`Getting categories for user ${userId}`);

  const categories = await categoryService.findCategories(userId);
  res.json(categories);
};

/** UPDATE */
export const updateCategory = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const categoryId = Number(req.params.id);
  const { name, color } = req.body;

  logger.info(`Updating category ${categoryId} for user ${userId}`);

  validateCategoryId(categoryId);

  if (name !== undefined) {
    validateCategoryName(name);
    validateCategoryNameLength(name);
  }

  if (color !== undefined) {
    validateCategoryColor(color);
  }

  const category = await categoryService.updateCategory(
    categoryId,
    userId,
    { name, color }
  );

  res.json(category);
};

/** DELETE */
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const categoryId = Number(req.params.id);

    logger.info(`Deleting category ${categoryId} for user ${userId}`);

    validateCategoryId(categoryId);

    await categoryService.deleteCategory(categoryId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
