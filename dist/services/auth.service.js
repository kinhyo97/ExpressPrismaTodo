"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const token_1 = require("../utils/token");
const client_1 = require("@prisma/client");
async function login(email, password) {
    const user = await db_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }
    if (user.status !== client_1.UserStatus.ACTIVE) {
        throw new Error("USER_NOT_ACTIVE");
    }
    const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!passwordMatch) {
        throw new Error("INVALID_CREDENTIALS");
    }
    // Access Token
    const accessToken = (0, token_1.signAccessToken)({
        userId: user.id,
        email: user.email,
    });
    // Refresh Token (plain)
    const refreshToken = (0, token_1.signRefreshToken)({
        userId: user.id,
        email: user.email,
    });
    // Hash refresh token before storing
    const refreshTokenHash = await bcryptjs_1.default.hash(refreshToken, 10);
    await db_1.prisma.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    return {
        accessToken,
        refreshToken,
    };
}
/**
 * =========================
 * REFRESH
 * =========================
 */
async function refresh(refreshToken) {
    const payload = (0, token_1.verifyRefreshToken)(refreshToken);
    const tokens = await db_1.prisma.refreshToken.findMany({
        where: {
            userId: payload.userId,
            expiresAt: {
                gt: new Date(),
            },
        },
    });
    const matchedToken = await Promise.all(tokens.map(async (t) => {
        const match = await bcryptjs_1.default.compare(refreshToken, t.token);
        return match ? t : null;
    })).then((r) => r.find(Boolean));
    if (!matchedToken) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }
    const newAccessToken = (0, token_1.signAccessToken)({
        userId: payload.userId,
        email: payload.email,
    });
    return {
        accessToken: newAccessToken,
    };
}
/**
 * =========================
 * LOGOUT
 * =========================
 */
async function logout(refreshToken) {
    const payload = (0, token_1.verifyRefreshToken)(refreshToken);
    const tokens = await db_1.prisma.refreshToken.findMany({
        where: {
            userId: payload.userId,
        },
    });
    for (const t of tokens) {
        const match = await bcryptjs_1.default.compare(refreshToken, t.token);
        if (match) {
            await db_1.prisma.refreshToken.update({
                where: { id: t.id },
                data: {},
            });
        }
    }
}
//# sourceMappingURL=auth.service.js.map