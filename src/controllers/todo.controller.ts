import { NextFunction, Request, Response } from "express";
import * as todoService from "../services/todo.service";
import { logger } from "../utils/logger";
import {
  validateTodoId,
  validateTodoDate,
} from "../validation/todo/todo.validation";
import { prisma } from "../config/db";
import { validateAnniversary } from "../validation/todo/anniversary.validation";

/** CREATE */
export const createTodo = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, date, categoryId } = req.body; // ⭐ 이 줄 핵심

  validateTodoDate(date);

  const todo = await todoService.createTodo(
    userId,
    title,
    date,
    categoryId ?? null
  );

  res.status(201).json(todo);
};

// 여러날 한번에 추가
export const createTodosByRange = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, categoryId, startDate, endDate,reminderTime  } = req.body;

  logger.info(`createTodosByRange ${startDate} ~ ${endDate} for user ${userId}`);

  validateTodoDate(startDate);
  validateTodoDate(endDate);

  const count = await todoService.createTodosByRange(
    userId,
    title,
    startDate,
    endDate,
    categoryId ?? null,
    reminderTime ?? null
  );

  res.status(201).json({ count });
};



/** READ */
export const getTodos = async (req: Request, res: Response) => {
  logger.info(`Getting todos for user ${req.user!.id}`);

  const userId = req.user!.id;
  const { date } = req.query;

  const todos = date
    ? await todoService.findTodosByDate(userId, String(date))
    : await todoService.findMyTodos(userId);

  res.json(todos);
};

export const getTodoById = async (req: Request, res: Response) => {
  logger.info(`Getting todo by id: ${req.params.id} for user ${req.user!.id}`);

  const userId = req.user!.id;
  const todoId = Number(req.params.id);

  validateTodoId(todoId);

  // db 인스턴스 기반 transaction 처리
  const todo = await todoService.findTodoById(prisma, todoId, userId);

  res.json(todo);
};

export const getTodosByRange = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { start, end } = req.query;

  logger.info(
    `Getting todos by range: ${start} ~ ${end} for user ${userId}`
  );

  if (!start || !end) {
    throw new Error("start and end query params are required");
  }

  // 날짜 문자열 검증 (YYYY-MM-DD)
  const startDate = String(start);
  const endDate = String(end);

  const todos = await todoService.findTodosByRange(
    prisma,
    userId,
    startDate,
    endDate
  );

  res.json(todos);
};

export const getRecentTodos = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const limit = Number(req.query.limit ?? 3);

  logger.info(
    `Getting recent ${limit} todos for user ${userId}`
  );

  const todos = await todoService.findRecentTodos(
    prisma,
    userId,
    limit
  );

  res.json(todos);
};



/** UPDATE */
export const updateTodo = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const todoId = Number(req.params.id);
  const {
  title,
  completed,
  description,
  reminderTime,
  reminderOffset,
  notificationId,
  categoryId,
} = req.body;

  console.log("===== UPDATE TODO CONTROLLER =====");
  console.log("req.params:", req.params);
  console.log("req.body:", req.body);
  console.log("req.user:", req.user);


  validateTodoId(todoId);

  const todo = await todoService.updateTodo(todoId, userId, {
    title,
    completed,
    description,
    reminderTime,
    reminderOffset,
    notificationId,
    categoryId,
  });

  res.json(todo);
};

/** TOGGLE */
export const toggleTodo = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const todoId = Number(req.params.id);

  validateTodoId(todoId);

  const todo = await todoService.toggleTodo(todoId, userId);
  
  res.json(todo);
};

/** DELETE */
export const deleteTodo = async (
  // Req,res는 따로 정의 하고 router의 validator에서 검증
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // userId와 todoId를 받아서 처리
    const userId = req.user!.id;
    const todoId = Number(req.params.id);

    validateTodoId(todoId);

    await todoService.deleteTodo(todoId, userId);
    // void로 return하고 front에서 204 받아서 성공처리
    res.status(204).send();
  } catch (err) {
    // 에러를 컨트롤러에서 처리하지 않고 전역 에러 미들웨어로 전송
    next(err);
  }
};

export const deleteAllTodos = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  await todoService.deleteAllTodos(userId);

  // 204 No Content
  res.status(204).send();
};


/* Anniversary 관련 Controller */

/** CREATE */
export const createAnniversary = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, month, day, color } = req.body;

  logger.info(`Creating anniversary for user ${userId}`);

  const DEFAULT_ANNIVERSARY_COLOR = "#3b82f6";
  const safeColor =
    typeof color === "string" && color.trim()
      ? color
      : DEFAULT_ANNIVERSARY_COLOR;

  validateAnniversary(month, day, safeColor);

  const anniversary = await prisma.anniversary.create({
    data: {
      title,
      month,
      day,
      color: safeColor,
      userId,
    },
  });

  res.status(201).json(anniversary);
};


/** READ (월별) */
export const getAnniversaries = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const month = Number(req.query.month);

  logger.info(
    `Getting anniversaries for user ${userId}, month=${month || "all"}`
  );

  const anniversaries = await prisma.anniversary.findMany({
    where: {
      userId,
      ...(month ? { month } : {}),
    },
    orderBy: [{ month: "asc" }, { day: "asc" }],
  });

  res.json(anniversaries);
};

/** UPDATE */
export const updateAnniversary = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  const { title, month, day, color } = req.body;

  logger.info(`Updating anniversary ${id} for user ${userId}`);

  const DEFAULT_ANNIVERSARY_COLOR = "#3b82f6";
  const safeColor =
    typeof color === "string" && color.trim()
      ? color
      : DEFAULT_ANNIVERSARY_COLOR;

  validateAnniversary(month, day, safeColor);

  const anniversary = await prisma.anniversary.findFirst({
    where: { id, userId },
  });

  if (!anniversary) {
    return res.status(404).json({ message: "Anniversary not found" });
  }

  const updated = await prisma.anniversary.update({
    where: { id },
    data: {
      title,
      month,
      day,
      color: safeColor,
    },
  });

  res.json(updated);
};


/** DELETE */
export const deleteAnniversary = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);

  logger.info(`Deleting anniversary ${id} for user ${userId}`);

  const anniversary = await prisma.anniversary.findFirst({
    where: { id, userId },
  });

  if (!anniversary) {
    return res.status(404).json({ message: "Anniversary not found" });
  }

  await prisma.anniversary.delete({
    where: { id },
  });

  res.status(204).send();
};

/** CALENDAR (Todo + Anniversary) */
export const getCalendarData = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { start, end } = req.query;

  if (!start || !end) {
    throw new Error("start and end query params are required");
  }

  const startDate = String(start);
  const endDate = String(end);

  // Todo는 range 조회 (연도 개념 있음)
  const todos = await todoService.findTodosByRange(
    prisma,
    userId,
    startDate,
    endDate
  );

  // Anniversary는 전부 조회 (연도 개념 없음, 매년 반복)
  const anniversaries = await prisma.anniversary.findMany({
    where: { userId },
    orderBy: [{ month: "asc" }, { day: "asc" }],
  });

  res.json({
    todos,
    anniversaries,
  });
};

