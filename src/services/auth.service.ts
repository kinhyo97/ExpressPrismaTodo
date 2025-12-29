import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/token";
import { UserStatus } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import { logger } from "../utils/logger";
// 이메일 인증관련
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/mailer";

// 이메일 인증관련
function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function makeRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function buildVerifyUrl(token: string) {
  const base = process.env.API_BASE_URL; // 예: http://localhost:3000
  if (!base) throw new Error("API_BASE_URL_NOT_CONFIGURED");
  return `${base}/auth/verify?token=${encodeURIComponent(token)}`;
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const getMe = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

export async function login(email: string, password: string) {
  const e = (email ?? "").trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: e },
  });

  if (!user) throw new Error("INVALID_CREDENTIALS");
  if (user.status !== UserStatus.ACTIVE) throw new Error("USER_NOT_ACTIVE");

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw new Error("INVALID_CREDENTIALS");

  // 이메일 인증 안하면 튕기게
  if (user.provider !== "google" && !user.emailVerifiedAt) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = signRefreshToken({
    userId: user.id,
    email: user.email,
  });

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
    },
  };
}

export async function refresh(refreshToken: string) {
  if (!refreshToken || !refreshToken.includes(".")) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const payload = verifyRefreshToken(refreshToken);

  const tokens = await prisma.refreshToken.findMany({
    where: {
      userId: payload.userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  const matchedToken = await Promise.all(
    tokens.map(async (t) => {
      const match = await bcrypt.compare(refreshToken, t.token);
      return match ? t : null;
    })
  ).then((r) => r.find(Boolean));

  if (!matchedToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  // 1️⃣ 기존 refreshToken 폐기
  await prisma.refreshToken.update({
    where: { id: matchedToken.id },
    data: { revokedAt: new Date() },
  });

  // 2️⃣ 새 refreshToken 발급
  const newRefreshToken = signRefreshToken({
    userId: payload.userId,
    email: payload.email,
  });

  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  await prisma.refreshToken.create({
    data: {
      userId: payload.userId,
      token: newRefreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 3️⃣ 새 accessToken 발급
  const newAccessToken = signAccessToken({
    userId: payload.userId,
    email: payload.email,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * =========================
 * LOGOUT
 * =========================
 */
export async function logout(refreshToken: string) {
  if (!refreshToken || !refreshToken.includes(".")) return;

  const payload = verifyRefreshToken(refreshToken);

  const tokens = await prisma.refreshToken.findMany({
    where: {
      userId: payload.userId,
      revokedAt: null,
    },
  });

  for (const t of tokens) {
    const match = await bcrypt.compare(refreshToken, t.token);
    if (match) {
      await prisma.refreshToken.update({
        where: { id: t.id },
        data: { revokedAt: new Date() },
      });
    }
  }
}

// Google 로그인
export async function loginWithGoogle(idToken: string) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID_NOT_CONFIGURED");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    throw new Error("GOOGLE_LOGIN_FAILED");
  }

  const email = payload.email;
  const googleUserId = payload.sub;

  // 🔥 provider 기준으로 찾기
  let user = await prisma.user.findFirst({
    where: {
      provider: "google",
      providerUserId: googleUserId,
    },
  });

  // 🔥 없으면 생성
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        provider: "google",
        providerUserId: payload.sub,
        status: UserStatus.ACTIVE,
        passwordHash: "",
        emailVerifiedAt: new Date(),
      },
    });
  }

  // 토큰 발급 (기존 로직 그대로)
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = signRefreshToken({
    userId: user.id,
    email: user.email,
  });

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
    },
  };
}

export async function inactive(userId: number) {
  logger.info(`user inactive service`);
  
  await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.INACTIVE }, // 또는 DELETED
  });

  // 옵션: refreshToken 전부 revoked 처리
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}


// 회원가입 api

export async function register(email: string, password: string) {
  const e = (email ?? "").trim().toLowerCase();
  if (!e) throw new Error("EMAIL_REQUIRED");
  if (!password) throw new Error("PASSWORD_REQUIRED");

  // 이미 존재하는지 확인
  const existing = await prisma.user.findUnique({ where: { email: e } });

  // 구글 계정으로 이미 가입된 이메일이면 일단 막는 게 단순함 (나중에 계정 연결 구현)
  if (existing && existing.provider === "google") {
    throw new Error("EMAIL_ALREADY_USED");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let userId: number;

  if (!existing) {
    const user = await prisma.user.create({
      data: {
        email: e,
        provider: "local",        // 너 schema에 맞춰서 "local" 또는 null
        providerUserId: null,
        passwordHash,
        status: UserStatus.ACTIVE, // ACTIVE로 두고, 로그인에서 emailVerifiedAt으로 차단
        emailVerifiedAt: null,
      },
      select: { id: true },
    });
    userId = user.id;
  } else {
    // 미인증 계정이면 비번 갱신 + 재발송 허용(사용자가 다시 시도할 때)
    if (existing.emailVerifiedAt) throw new Error("EMAIL_ALREADY_USED");

    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash },
    });
    userId = existing.id;
  }

  // 이전 토큰들 정리(선택)
  await prisma.emailVerification.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() }, // 기존 미사용 토큰 무효화
  });

  const rawToken = makeRandomToken(32);
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30분

  await prisma.emailVerification.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const verifyUrl = buildVerifyUrl(rawToken);
  await sendVerificationEmail(e, verifyUrl);

  return { email: e };
}

/**
 * =========================
 * VERIFY EMAIL
 * =========================
 */
export async function verifyEmail(token: string) {
  if (!token) throw new Error("TOKEN_REQUIRED");

  const tokenHash = sha256(token);

  const record = await prisma.emailVerification.findUnique({
    where: { tokenHash },
  });

  if (!record) throw new Error("INVALID_TOKEN");
  if (record.usedAt) throw new Error("TOKEN_ALREADY_USED");
  if (record.expiresAt <= new Date()) throw new Error("TOKEN_EXPIRED");

  await prisma.$transaction([
    prisma.emailVerification.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);

  return true;
}

/**
 * =========================
 * RESEND VERIFICATION
 * =========================
 */
export async function resendVerification(email: string) {
  const e = (email ?? "").trim().toLowerCase();
  if (!e) throw new Error("EMAIL_REQUIRED");

  const user = await prisma.user.findUnique({ where: { email: e } });
  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.provider === "google") return { email: e }; // google은 이미 verified 처리
  if (user.emailVerifiedAt) return { email: e };

  // 기존 토큰 무효화
  await prisma.emailVerification.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const rawToken = makeRandomToken(32);
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.emailVerification.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const verifyUrl = buildVerifyUrl(rawToken);
  await sendVerificationEmail(e, verifyUrl);

  return { email: e };
}