// utils/date.ts

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
export const now = (): Date => new Date();

/**
 * ISO 문자열 반환
 * - 로그, 응답, DB 저장 시 사용
 */
export const toISOString = (date: Date): string => {
  return date.toISOString();
};

/**
 * 현재 시각 기준으로 N분 뒤 Date 반환
 */
export const addMinutes = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * 현재 시각 기준으로 N시간 뒤 Date 반환
 */
export const addHours = (hours: number): Date => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

/**
 * 현재 시각 기준으로 N일 뒤 Date 반환
 */
export const addDays = (days: number): Date => {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

/**
 * 두 날짜 비교
 * - a가 b보다 이후면 true
 */
export const isAfter = (a: Date, b: Date): boolean => {
  return a.getTime() > b.getTime();
};

/**
 * 두 날짜 비교
 * - a가 b보다 이전이면 true
 */
export const isBefore = (a: Date, b: Date): boolean => {
  return a.getTime() < b.getTime();
};

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
