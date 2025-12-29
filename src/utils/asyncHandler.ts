// utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Express async controller wrapper
 * - try/catch 제거
 * - Promise rejection 자동 next 전달
 */

export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };


/*
====================================
usage
====================================

1️⃣ controller (try/catch 제거)

export const deleteTodo = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;
  const todoId = Number(req.params.id);

  await todoService.deleteTodo(todoId, userId);
  res.sendStatus(204);
};

------------------------------------

2️⃣ router에서 asyncHandler로 감싸기

import { asyncHandler } from "../utils/asyncHandler";
import * as todoController from "../controllers/todo.controller";

router.delete(
  "/:id",
  asyncHandler(todoController.deleteTodo)
);

------------------------------------

3️⃣ 에러 흐름

Controller (throw / reject)
  ↓
asyncHandler
  ↓
next(err)
  ↓
error.middleware.ts

------------------------------------

❗ 주의사항

- asyncHandler 안에서 try/catch 쓰지 말 것 (중복)
- handler 타입은 반드시 RequestHandler
- 에러 처리는 전부 error middleware에서 수행

====================================
*/