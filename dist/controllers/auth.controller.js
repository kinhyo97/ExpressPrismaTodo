"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const authService = __importStar(require("../services/auth.service"));
/**
 * =========================
 * LOGIN
 * =========================
 * POST /auth/login
 * body: { email, password }
 */
console.log("authService keys:", Object.keys(authService));
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "EMAIL_AND_PASSWORD_REQUIRED",
        });
    }
    const result = await authService.login(email, password);
    return res.status(200).json(result);
}
/**
 * =========================
 * REFRESH
 * =========================
 * POST /auth/refresh
 * body: { refreshToken }
 */
async function refresh(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            message: "REFRESH_TOKEN_REQUIRED",
        });
    }
    const result = await authService.refresh(refreshToken);
    return res.status(200).json(result);
}
/**
 * =========================
 * LOGOUT
 * =========================
 * POST /auth/logout
 * body: { refreshToken }
 */
async function logout(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            message: "REFRESH_TOKEN_REQUIRED",
        });
    }
    await authService.logout(refreshToken);
    return res.status(204).send();
}
//# sourceMappingURL=auth.controller.js.map