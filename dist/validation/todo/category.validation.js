"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCategoryColor = exports.validateCategoryNameLength = exports.validateCategoryName = exports.validateCategoryId = void 0;
const ApiError_1 = require("../../utils/ApiError");
const validateCategoryId = (id) => Number.isNaN(id) &&
    (() => {
        throw new ApiError_1.ApiError("INVALID_CATEGORY_ID");
    })();
exports.validateCategoryId = validateCategoryId;
const validateCategoryName = (name) => (!name || !name.trim()) &&
    (() => {
        throw new ApiError_1.ApiError("INVALID_CATEGORY_NAME");
    })();
exports.validateCategoryName = validateCategoryName;
const validateCategoryNameLength = (name) => name.length > 50 &&
    (() => {
        throw new ApiError_1.ApiError("CATEGORY_NAME_TOO_LONG");
    })();
exports.validateCategoryNameLength = validateCategoryNameLength;
const validateCategoryColor = (color) => (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) &&
    (() => {
        throw new ApiError_1.ApiError("INVALID_CATEGORY_COLOR");
    })();
exports.validateCategoryColor = validateCategoryColor;
//# sourceMappingURL=category.validation.js.map