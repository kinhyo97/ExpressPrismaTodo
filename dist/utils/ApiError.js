"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
const errorCodes_1 = require("../constants/errorCodes");
// API 에러를 나타내는 커스텀 에러 클래스
// 각 에러는 상태 코드와 에러 코드를 포함
// 예: new ApiError("TODO_NOT_FOUND")
class ApiError extends Error {
    constructor(code) {
        super(errorCodes_1.ERROR_CODES[code].message);
        this.code = code;
        this.status = errorCodes_1.ERROR_CODES[code].status;
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map