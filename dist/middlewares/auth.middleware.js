"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// JwtPayLoad를 이용한 토큰 검증 미들웨어
const authMiddleware = (req, res, next) => {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    // 토큰이 없으면 401 Unauthorized 응답
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }
    // "Bearer <token>" 형식에서 토큰 부분만 추출
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Invalid authorization format" });
    }
    // 토큰 검증
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "dev-secret");
        // req.user에 사용자 정보 저장
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        // 다음 미들웨어 또는 컨트롤러로 이동
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map