import { Request, Response, NextFunction } from "express";

// 모의 인증 미들웨어
export const mockAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 로그인된 사용자라고 가정
  req.user = {
    id: 1,
    email: "test@test.com",
  };

  // 다음 미들웨어 또는 컨트롤러로 이동
  next();
};
