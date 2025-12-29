"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * Auth Routes
 * prefix: /auth
 */
// 회원가입
router.post("/signup", auth_controller_1.signup);
// 로그인
router.post("/login", auth_controller_1.login);
// 로그아웃
router.post("/logout", auth_middleware_1.authMiddleware, auth_controller_1.logout);
// 토큰 재발급
router.post("/refresh", auth_controller_1.refreshToken);
// 내 정보 조회
router.get("/me", auth_middleware_1.authMiddleware, auth_controller_1.getMe);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map