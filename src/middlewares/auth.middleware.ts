// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../types/user";

// JWT 안에 실제로 들어있는 payload 형태
interface JwtPayload {
  userId: number;
  email: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Authorization header missing" });
  }

  // "Bearer <token>" 형식에서 토큰 부분만 추출
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Invalid authorization format" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret"
    ) as JwtPayload;

    // 토큰의 userId → req.user.id 로 매핑 + userId도 같이 넣어둠
    const user: UserPayload = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
    };

    // req.user에 사용자 정보 저장
    req.user = user;

    // 다음 미들웨어 또는 컨트롤러로 이동
    next();
  } catch (err) {
    console.error("[authMiddleware] verify error:", err);
    return res
      .status(401)
      .json({ message: "Invalid or expired token" });
  }
};
