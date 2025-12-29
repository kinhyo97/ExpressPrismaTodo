"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTodoDate = exports.validateTodoTitleLength = exports.validateTodoTitle = exports.validateTodoId = void 0;
const ApiError_1 = require("../../utils/ApiError");
const validateTodoId = (id) => Number.isNaN(id) &&
    (() => {
        throw new ApiError_1.ApiError("INVALID_TODO_ID");
    })();
exports.validateTodoId = validateTodoId;
const validateTodoTitle = (title) => (!title || !title.trim()) &&
    (() => {
        throw new ApiError_1.ApiError("INVALID_TITLE");
    })();
exports.validateTodoTitle = validateTodoTitle;
const validateTodoTitleLength = (title) => title.length > 100 &&
    (() => {
        throw new ApiError_1.ApiError("TITLE_TOO_LONG");
    })();
exports.validateTodoTitleLength = validateTodoTitleLength;
const validateTodoDate = (date) => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ApiError_1.ApiError("INVALID_TODO_DATE");
    }
};
exports.validateTodoDate = validateTodoDate;
//# sourceMappingURL=todo.validation.js.map