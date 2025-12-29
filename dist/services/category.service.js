"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.findCategories = exports.createCategory = void 0;
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
/** CREATE */
const createCategory = async (userId, name, color) => {
    if (!name)
        throw new ApiError_1.ApiError("INVALID_CATEGORY_NAME");
    if (!color)
        throw new ApiError_1.ApiError("INVALID_CATEGORY_COLOR");
    return db_1.prisma.category.create({
        data: {
            name,
            color,
            userId,
        },
    });
};
exports.createCategory = createCategory;
/** READ */
const findCategories = async (userId) => {
    console.log("find Categories service");
    return db_1.prisma.category.findMany({
        where: { userId },
        orderBy: { id: "asc" },
    });
};
exports.findCategories = findCategories;
/** UPDATE */
const updateCategory = async (categoryId, userId, data) => {
    const category = await db_1.prisma.category.findFirst({
        where: { id: categoryId, userId },
    });
    if (!category) {
        throw new ApiError_1.ApiError("CATEGORY_NOT_FOUND");
    }
    const updateData = {};
    if (data.name !== undefined)
        updateData.name = data.name;
    if (data.color !== undefined)
        updateData.color = data.color;
    if (Object.keys(updateData).length === 0) {
        return category;
    }
    return db_1.prisma.category.update({
        where: { id: categoryId },
        data: updateData,
    });
};
exports.updateCategory = updateCategory;
/** DELETE */
const deleteCategory = async (categoryId, userId) => {
    const category = await db_1.prisma.category.findFirst({
        where: { id: categoryId, userId },
    });
    if (!category) {
        throw new ApiError_1.ApiError("CATEGORY_NOT_FOUND");
    }
    // 🔥 연결된 Todo들의 categoryId 해제
    await db_1.prisma.todo.updateMany({
        where: {
            userId,
            categoryId,
        },
        data: {
            categoryId: null,
        },
    });
    await db_1.prisma.category.delete({
        where: { id: categoryId },
    });
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.service.js.map