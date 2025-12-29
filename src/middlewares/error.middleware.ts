import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

// 에러 처리 미들웨어
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // ApiError 인스턴스인 경우, 해당 상태 코드와 메시지로 응답
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
    });
  }

  // 그 외의 에러는 500 Internal Server Error로 응답
  console.error(err);
  return res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
};
