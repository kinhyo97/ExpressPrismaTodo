"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// 토큰 만료시간 상수 설정
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
// 환경변수 로딩
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
// 런타임 안정성 체크
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined");
}
// access token 생성
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
}
// access token 검증
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    return {
        userId: decoded.userId,
        email: decoded.email,
    };
}
// refresh token 생성
function signRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
        algorithm: "HS256",
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
}
// refresh token 검증
function verifyRefreshToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
    return {
        userId: decoded.userId,
        email: decoded.email,
    };
}
//# sourceMappingURL=token.js.map