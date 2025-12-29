"use strict";
// utils/date.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBefore = exports.isAfter = exports.addDays = exports.addHours = exports.addMinutes = exports.toISOString = exports.now = void 0;
/**
 * date utils
 * ----------------------------
 * 날짜/시간 관련 공통 유틸
 *
 * 목적:
 * - Date 생성 로직 통일
 * - 시간 계산 실수 방지
 * - 토큰 만료, 만료일 계산, 로그 타임 등에 사용
 */
/**
 * 현재 시간 반환
 * - new Date() 직접 쓰지 않고 이 함수만 사용 권장
 */
const now = () => new Date();
exports.now = now;
/**
 * ISO 문자열 반환
 * - 로그, 응답, DB 저장 시 사용
 */
const toISOString = (date) => {
    return date.toISOString();
};
exports.toISOString = toISOString;
/**
 * 현재 시각 기준으로 N분 뒤 Date 반환
 */
const addMinutes = (minutes) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};
exports.addMinutes = addMinutes;
/**
 * 현재 시각 기준으로 N시간 뒤 Date 반환
 */
const addHours = (hours) => {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
};
exports.addHours = addHours;
/**
 * 현재 시각 기준으로 N일 뒤 Date 반환
 */
const addDays = (days) => {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
exports.addDays = addDays;
/**
 * 두 날짜 비교
 * - a가 b보다 이후면 true
 */
const isAfter = (a, b) => {
    return a.getTime() > b.getTime();
};
exports.isAfter = isAfter;
/**
 * 두 날짜 비교
 * - a가 b보다 이전이면 true
 */
const isBefore = (a, b) => {
    return a.getTime() < b.getTime();
};
exports.isBefore = isBefore;
/*
====================================
usage
====================================

1️⃣ createdAt / updatedAt 기본값

const todo = await prisma.todo.create({
  data: {
    title: "할 일",
    userId,
    createdAt: now(),
  },
});

------------------------------------

2️⃣ JWT / Refresh Token 만료 시간 계산

import { addHours } from "../utils/date";

const accessTokenExpiresAt = addHours(1);
const refreshTokenExpiresAt = addDays(14);

------------------------------------

3️⃣ 만료 여부 체크

import { isAfter, now } from "../utils/date";

if (isAfter(now(), token.expiresAt)) {
  throw new ApiError(401, "TOKEN_EXPIRED");
}

------------------------------------

4️⃣ 로그 타임 통일

import { toISOString, now } from "../utils/date";

logger.info(`[LOGIN] time=${toISOString(now())}`);

------------------------------------

❗ 주의사항

- new Date()를 코드 여기저기서 직접 쓰지 말 것
- 날짜 계산 로직은 반드시 utils/date.ts를 통해 수행
- 복잡한 캘린더 계산(월 단위 등)이 필요해질 때만 dayjs / date-fns 도입

====================================
*/
//# sourceMappingURL=date.js.map