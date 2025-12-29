import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

/** Categories */
router.get("/", asyncHandler(categoryController.getCategories));
router.post("/", asyncHandler(categoryController.createCategory));
router.put("/:id", asyncHandler(categoryController.updateCategory));
router.delete("/:id", asyncHandler(categoryController.deleteCategory));

export default router;
