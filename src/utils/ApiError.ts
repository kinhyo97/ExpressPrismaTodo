import { ERROR_CODES, ErrorCode } from "../constants/errorCodes";

// API 에러를 나타내는 커스텀 에러 클래스
// 각 에러는 상태 코드와 에러 코드를 포함
// 예: new ApiError("TODO_NOT_FOUND")

export class ApiError extends Error {
  status: number;
  code: ErrorCode;

  constructor(code: ErrorCode) {
    super(ERROR_CODES[code].message);
    this.code = code;
    this.status = ERROR_CODES[code].status;
  }
}
