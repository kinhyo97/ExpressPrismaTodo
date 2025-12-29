import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

/** CREATE */
export const createCategory = async (
  userId: number,
  name: string,
  color: string
) => {
  if (!name) throw new ApiError("INVALID_CATEGORY_NAME");
  if (!color) throw new ApiError("INVALID_CATEGORY_COLOR");

  return prisma.category.create({
    data: {
      name,
      color,
      userId,
    },
  });
};

/** READ */
export const findCategories = async (userId: number) => {
    console.log("find Categories service")
  return prisma.category.findMany({
    where: { userId },
    orderBy: { id: "asc" },
  });
};

/** UPDATE */
export const updateCategory = async (
  categoryId: number,
  userId: number,
  data: {
    name?: string;
    color?: string;
  }
) => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw new ApiError("CATEGORY_NOT_FOUND");
  }

  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.color !== undefined) updateData.color = data.color;

  if (Object.keys(updateData).length === 0) {
    return category;
  }

  return prisma.category.update({
    where: { id: categoryId },
    data: updateData,
  });
};

/** DELETE */
export const deleteCategory = async (
  categoryId: number,
  userId: number
) => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw new ApiError("CATEGORY_NOT_FOUND");
  }

  // 🔥 연결된 Todo들의 categoryId 해제
  await prisma.todo.updateMany({
    where: {
      userId,
      categoryId,
    },
    data: {
      categoryId: null,
    },
  });

  await prisma.category.delete({
    where: { id: categoryId },
  });
};
