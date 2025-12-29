import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * =========================
 * AUTH
 * =========================
 */

/** register */
router.post("/register", authController.register);
router.post("/resend-verification", authController.resendVerification);
router.get("/verify", authController.verifyEmail);

/** login */
router.post("/login", asyncHandler(authController.login));
router.post("/google", authController.googleLogin);

/** refresh */
router.post("/refresh", asyncHandler(authController.refresh));

/** logout */
router.post("/logout", asyncHandler(authController.logout));
router.get("/me", authMiddleware, asyncHandler(authController.me));

// 회원 비활성화
router.patch("/inactive", authMiddleware, asyncHandler(authController.inactive));
export default router;
