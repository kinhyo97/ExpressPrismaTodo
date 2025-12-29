import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "UNAUTHORIZED" });
  }

  // 🔥 userId로 꺼내야 함
  const userId = req.user.userId;

  const user = await authService.getMe(userId);
  return res.json(user);
};

/**
 * =========================
 * LOGIN
 * =========================
 * POST /auth/login
 * body: { email, password }
 */
console.log("authService keys:", Object.keys(authService));

export const login = async (req: Request, res: Response) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  const { accessToken, refreshToken, user } =
    await authService.login(email, password);

  // Refresh Token → HttpOnly Cookie
  res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/auth/refresh",
  maxAge: 1000 * 60 * 60 * 24 * 7,
});

  return res.json({
    accessToken,
    user,
  });
};

// 구글 로그인
// GOOGLE SOCIAL LOGIN
// POST /auth/google
// body: { idToken }
export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "GOOGLE_ID_TOKEN_REQUIRED" });
  }

  const { accessToken, refreshToken, user } =
    await authService.loginWithGoogle(idToken);

  // 기존 login()이랑 똑같이 refresh 토큰 쿠키에 저장
  res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/auth/refresh",
  maxAge: 1000 * 60 * 60 * 24 * 7,
});


  return res.json({
    accessToken,
    user,
  });
};



/**
 * =========================
 * REFRESH
 * =========================
 * POST /auth/refresh
 * body: { refreshToken }
 */
export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "NO_REFRESH_TOKEN" });
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refresh(refreshToken);

  // 🔥 새 refreshToken 쿠키로 교체
  res.cookie("refreshToken", newRefreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/auth/refresh",
  maxAge: 1000 * 60 * 60 * 24 * 7,
});


  // ✅ accessToken은 string으로만 반환
  return res.json({ accessToken });
};



/**
 * =========================
 * LOGOUT
 * =========================
 * POST /auth/logout
 * body: { refreshToken }
 */
export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie("refreshToken", {
  path: "/auth/refresh",
  secure: true,
  sameSite: "none",
});


  return res.status(204).send();
};

// 회원 비활성화
export const inactive = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await authService.inactive(userId);
  return res.status(204).send();
};

// 이메일 인증관련

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("[REGISTER]", req.body);

  const result = await authService.register(email, password);
  return res.status(201).json({
    message: "VERIFY_EMAIL_SENT",
    ...result,
  });
};

export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await authService.resendVerification(email);
  return res.json({
    message: "VERIFY_EMAIL_SENT",
    ...result,
  });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const token = String(req.query.token ?? "");

  try {
    await authService.verifyEmail(token);

    // 지금 단계: 앱으로 안 보내고, 웹에서 완료 안내만
    return res
      .status(200)
      .type("html")
      .send(`
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: sans-serif; padding: 24px;">
            <h2>이메일 인증이 완료되었습니다.</h2>
            <p>앱으로 돌아가 로그인해 주세요.</p>
          </body>
        </html>
      `);
  } catch (e: any) {
    return res
      .status(400)
      .type("html")
      .send(`
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: sans-serif; padding: 24px;">
            <h2>인증 링크가 유효하지 않습니다.</h2>
            <p>${String(e?.message ?? "VERIFY_FAILED")}</p>
          </body>
        </html>
      `);
  }
};