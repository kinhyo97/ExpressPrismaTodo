"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategories = exports.createCategory = void 0;
const categoryService = __importStar(require("../services/category.service"));
const logger_1 = require("../utils/logger");
const category_validation_1 = require("../validation/todo/category.validation");
/** CREATE */
const createCategory = async (req, res) => {
    const userId = req.user.id;
    const { name, color } = req.body;
    logger_1.logger.info(`Creating category for user ${userId}`);
    (0, category_validation_1.validateCategoryName)(name);
    (0, category_validation_1.validateCategoryNameLength)(name);
    (0, category_validation_1.validateCategoryColor)(color);
    const category = await categoryService.createCategory(userId, name, color);
    res.status(201).json(category);
};
exports.createCategory = createCategory;
/** READ */
const getCategories = async (req, res) => {
    console.log("get Categories controller");
    const userId = req.user.id;
    logger_1.logger.info(`Getting categories for user ${userId}`);
    const categories = await categoryService.findCategories(userId);
    res.json(categories);
};
exports.getCategories = getCategories;
/** UPDATE */
const updateCategory = async (req, res) => {
    const userId = req.user.id;
    const categoryId = Number(req.params.id);
    const { name, color } = req.body;
    logger_1.logger.info(`Updating category ${categoryId} for user ${userId}`);
    (0, category_validation_1.validateCategoryId)(categoryId);
    if (name !== undefined) {
        (0, category_validation_1.validateCategoryName)(name);
        (0, category_validation_1.validateCategoryNameLength)(name);
    }
    if (color !== undefined) {
        (0, category_validation_1.validateCategoryColor)(color);
    }
    const category = await categoryService.updateCategory(categoryId, userId, { name, color });
    res.json(category);
};
exports.updateCategory = updateCategory;
/** DELETE */
const deleteCategory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const categoryId = Number(req.params.id);
        logger_1.logger.info(`Deleting category ${categoryId} for user ${userId}`);
        (0, category_validation_1.validateCategoryId)(categoryId);
        await categoryService.deleteCategory(categoryId, userId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.controller.js.map