"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// utils/logger.ts
const fluent_logger_1 = __importDefault(require("fluent-logger"));
const pino_1 = __importDefault(require("pino"));
/**
 * logger
 * ----------------------------
 * 애플리케이션 전역 로거
 *
 * 목적:
 * - console.log 대체
 * - 로그 레벨 통일
 * - 운영/개발 환경 분리
 *
 * 사용 원칙:
 * - console.log / console.error 직접 사용 ❌
 * - logger.{info|warn|error|debug} 만 사용
 */
/**
 * 로그 레벨
 * - development: debug
 * - production: info
 */
const isProd = process.env.NODE_ENV === "production";
/**
 * Fluent Bit logger (운영용)
 */
const fluent = isProd
    ? fluent_logger_1.default.createFluentSender("todo-api", {
        host: process.env.FLUENT_HOST || "fluent-bit",
        port: 24224,
        timeout: 3.0,
        reconnectInterval: 10000,
    })
    : null;
/**
 * pino logger
 */
exports.logger = (0, pino_1.default)({
    level: isProd ? "info" : "debug",
}, isProd
    ? {
        write: (msg) => {
            try {
                fluent?.emit("log", JSON.parse(msg));
            }
            catch (e) {
                // JSON 파싱 실패 시 무시
            }
        },
    }
    : pino_1.default.transport({
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
        },
    }));
/*
====================================
usage
====================================

1️⃣ 기본 로그

import { logger } from "../utils/logger";

logger.info("server started");
logger.debug("debug message");
logger.warn("warning message");
logger.error("error message");

------------------------------------

2️⃣ 컨텍스트 포함 로그 (실무에서 제일 많이 씀)

logger.info(
  { userId, todoId },
  "todo deleted"
);

------------------------------------

3️⃣ 에러 로깅 (error middleware에서)

import { logger } from "../utils/logger";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(
    {
      method: req.method,
      path: req.originalUrl,
      err,
    },
    "request error"
  );

  res.status(500).json({ message: "Internal Server Error" });
};

------------------------------------

4️⃣ 서비스 레벨 로그 (비즈니스 이벤트)

logger.info(
  { userId },
  "user signup completed"
);

------------------------------------

❗ 주의사항

- console.log / console.error 사용 금지
- 객체 로그는 첫 번째 인자로 넘길 것
- 문자열 + 객체 섞지 말 것

  ❌ logger.info("user", userId);
  ✅ logger.info({ userId }, "user");

====================================
*/
//# sourceMappingURL=logger.js.map