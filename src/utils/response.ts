// utils/response.ts

/**
 * response utils
 * ----------------------------
 * API 응답 포맷 통일용 유틸
 *
 * 목적:
 * - 성공 응답 포맷 일관성 유지
 * - 프론트엔드 처리 단순화
 * - 상태 코드 + 데이터 구조 명확화
 *
 * 기본 원칙:
 * - 성공 응답은 success: true
 * - 에러 응답은 error.middleware에서 처리
 */

/**
 * 200 OK
 */
export const ok = <T>(data: T) => {
  return {
    success: true,
    data,
  };
};

/**
 * 201 Created
 */
export const created = <T>(data: T) => {
  return {
    success: true,
    data,
  };
};

/**
 * 204 No Content 대체 응답
 * - body가 필요한 경우에만 사용
 */
export const empty = () => {
  return {
    success: true,
  };
};

/*
====================================
usage
====================================

1️⃣ 목록 조회 (200)

import { ok } from "../utils/response";

export const getTodos = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const todos = await todoService.findMyTodos(userId);
  res.status(200).json(ok(todos));
};

------------------------------------

2️⃣ 생성 (201)

import { created } from "../utils/response";

export const createTodo = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title } = req.body;

  const todo = await todoService.createTodo(userId, title);
  res.status(201).json(created(todo));
};

------------------------------------

3️⃣ 삭제 (204)

export const deleteTodo = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const todoId = Number(req.params.id);

  await todoService.deleteTodo(todoId, userId);
  res.sendStatus(204); // response util 사용 안 함 (정석)
};

------------------------------------

4️⃣ 프론트엔드에서 응답 처리 예시

if (response.success) {
  render(response.data);
}

------------------------------------

❗ 주의사항

- 204 No Content에는 body 보내지 말 것
- 성공/실패 판단은 HTTP status + success 필드로 명확히
- 에러 응답은 response.ts에서 만들지 말 것
  → error.middleware.ts 단일 책임

====================================
*/
