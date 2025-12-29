// utils/pagination.ts

/**
 * pagination utils
 * ----------------------------
 * 페이지네이션 공통 유틸
 *
 * 목적:
 * - page / size 계산 로직 통일
 * - skip / take 계산 중복 제거
 * - 응답 포맷 표준화
 *
 * 사용 위치:
 * - Service 계층
 * - Repository 계층 (있다면)
 */

/**
 * 요청 옵션 타입
 */
export interface PageOptions {
  page?: number;
  size?: number;
}

/**
 * 페이지 응답 타입
 */
export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

/**
 * 기본값 / 제한값
 */
const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;
const MAX_SIZE = 100;

/**
 * page / size를 받아 skip / take 계산
 */
export const getPagination = (options: PageOptions) => {
  const page =
    options.page && options.page > 0 ? options.page : DEFAULT_PAGE;

  const size =
    options.size && options.size > 0
      ? Math.min(options.size, MAX_SIZE)
      : DEFAULT_SIZE;

  const skip = (page - 1) * size;
  const take = size;

  return {
    page,
    size,
    skip,
    take,
  };
};

/**
 * 페이징 응답 포맷 생성
 */
export const toPageResult = <T>(
  items: T[],
  total: number,
  page: number,
  size: number
): PageResult<T> => {
  return {
    items,
    page,
    size,
    total,
    totalPages: Math.ceil(total / size),
  };
};

/*
====================================
usage
====================================

1️⃣ Service에서 사용 (Prisma 기준)

import { getPagination, toPageResult } from "../utils/pagination";

export const findMyTodos = async (
  userId: number,
  opts: { page?: number; size?: number }
) => {
  const { page, size, skip, take } = getPagination(opts);

  const [items, total] = await prisma.$transaction([
    prisma.todo.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.todo.count({
      where: { userId },
    }),
  ]);

  return toPageResult(items, total, page, size);
};

------------------------------------

2️⃣ Controller는 값만 전달

export const getTodos = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const page = Number(req.query.page);
  const size = Number(req.query.size);

  const result = await todoService.findMyTodos(userId, { page, size });
  res.json(result);
};

------------------------------------

3️⃣ 실제 요청 예시

GET /todos
→ page=1, size=10 (기본값)

GET /todos?page=2&size=5
→ skip=5, take=5

GET /todos?size=200
→ size=100 (MAX_SIZE로 제한)

------------------------------------

❗ 주의사항

- Controller에서 skip/take 계산 ❌
- page/size 기본값은 pagination.ts에서만 관리
- MAX_SIZE는 반드시 제한 둘 것 (DoS 방지)

====================================
*/
