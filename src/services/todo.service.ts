import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

// 카테고리 정의파일
const categoryInclude = {
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
};

// 시간 제거 함수
function normalizeDate(d: Date) {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

type UpdateTodoPayload = {
  title?: string;
  completed?: boolean;
  description?: string;
  reminderTime?: string | null;
  reminderOffset?: number | null;
  notificationId?: string | null;
  categoryId?: number | null;
};


/** CREATE */
export const createTodo = async (
  userId: number,
  title: string,
  date: string,
  categoryId: number | null
) => {
  logger.info(
    `Creating todo for user ${userId} with title: ${title}, date: ${date}, categoryId: ${categoryId}`
  );

  if (!title) throw new ApiError("INVALID_TITLE");
  if (!date) throw new ApiError("INVALID_TODO_DATE");

  return prisma.todo.create({
    data: {
      title,
      date: new Date(date),
      userId,
      categoryId, 
    },
    include: categoryInclude, 
  });
};




function parseDateUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}


export const createTodosByRange = async (
  userId: number,
  title: string,
  startDate: string,
  endDate: string,
  categoryId: number | null,
  reminderTime: Date | null
) => {
  const start = parseDateUTC(startDate);
  const end = parseDateUTC(endDate);

  if (start > end) {
    throw new ApiError("INVALID_TODO_DATE");
  }

  const diffDays =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  let count = 0;

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < diffDays; i++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + i); 

      await tx.todo.create({
        data: {
          title,
          date, 
          userId,
          categoryId,
          reminderTime,
        },
      });

      count++;
    }
  });

  return count;
};



/** READ */
export const findMyTodos = async (userId: number) => {
  logger.info(`Finding todos for user ${userId}`);

  return prisma.todo.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    include: categoryInclude,
  });
};

/** READ (DATE BASED) */
export const findTodosByDate = async (
  userId: number,
  date: string
) => {
  logger.info(`Finding todos for user ${userId} on date ${date}`);

  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);

  return prisma.todo.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { createdAt: "asc" },
    include: categoryInclude,
  });
};

// db 인스턴스 기반 transaction 처리
export const findTodoById = async (
  db: PrismaClient,
  todoId: number,
  userId: number
) => {
  logger.info(`Finding todo ${todoId} for user ${userId}`);

  const todo = await db.todo.findFirst({
    where: { id: todoId, userId },
  });

  if (!todo) throw new ApiError("TODO_NOT_FOUND");

  return todo;
};

export const findTodosByRange = async (
  prisma: PrismaClient,
  userId: number,
  start: string,
  end: string
) => {
  return prisma.todo.findMany({
    where: {
      userId,
      date: {
        gte: new Date(start),
        lte: new Date(end),
      },
    },
    orderBy: {
      date: "asc",
    },
    include: categoryInclude,
  });
};


export const findRecentTodos = async (
  prisma: PrismaClient,
  userId: number,
  limit: number
) => {
  return prisma.todo.findMany({
    where: {
      userId,
      date: {
        gte: new Date(), // 오늘 이후 일정만
      },
    },
    orderBy: {
      createdAt: "desc", // 최신 생성 순
    },
    take: limit,
    include: categoryInclude,
  });
};



/** UPDATE */
export const updateTodo = async (
  todoId: number,
  userId: number,
  data: UpdateTodoPayload
) => {
  logger.info(
    `Updating todo ${todoId} for user ${userId} with data: ${JSON.stringify(
      data
    )}`
  );

  // 🔥 PATCH 핵심: undefined 제거
  const updateData: any = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.completed !== undefined) {
    updateData.completed = data.completed;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.reminderTime !== undefined) {
    updateData.reminderTime = data.reminderTime
      ? new Date(data.reminderTime)
      : null;
  }

  if (data.reminderOffset !== undefined) updateData.reminderOffset = data.reminderOffset;
  //if (data.notificationId !== undefined) updateData.notificationId = data.notificationId;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

  logger.info(`FINAL updateData: ${JSON.stringify(updateData)}`);

  if (Object.keys(updateData).length === 0) {
    logger.warn("No fields to update");
    return prisma.todo.findUnique({
      where: { id: todoId, userId },
    });
  }

  return prisma.todo.update({
    where: { id: todoId, userId },
    data: updateData,
  });
};



/** TOGGLE */
export const toggleTodo = async (todoId: number, userId: number) => {
  logger.info(`Toggling todo ${todoId} for user ${userId}`);

  const todo = await prisma.todo.findFirst({
    where: { id: todoId, userId },
  });

  if (!todo) {
    throw new ApiError("TODO_NOT_FOUND");
  }

  return prisma.todo.update({
    where: { id: todoId },
    data: { completed: !todo.completed },
  });
};

/** DELETE */
export const deleteTodo = async (todoId: number, userId: number) => {
  logger.info(`Deleting todo ${todoId} for user ${userId}`);

  try {
    return await prisma.todo.delete({
      where: {
        id: todoId,
        userId,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      throw new ApiError("TODO_NOT_FOUND");
    }
    throw e;
  }
};

// 전체삭제 todo
/** DELETE ALL */
export const deleteAllTodos = async (userId: number) => {
  logger.info(`Deleting ALL todos for user ${userId}`);

  // 해당 유저의 todo 전부 삭제
  const result = await prisma.todo.deleteMany({
    where: { userId },
  });

  return result; // { count: number } 필요하면 컨트롤러에서 사용 가능
};


/* Anniversary 관련 서비스 함수들 */
/** CREATE */
export const createAnniversary = async (
  userId: number,
  title: string,
  month: number,
  day: number,
  color: string
) => {
  return prisma.anniversary.create({
    data: {
      title,
      month,
      day,
      color,
      userId,
    },
  });
};

/** READ (월별 / 전체) */
export const findAnniversaries = async (
  userId: number,
  month?: number
) => {
  return prisma.anniversary.findMany({
    where: {
      userId,
      ...(month ? { month } : {}),
    },
    orderBy: [{ month: "asc" }, { day: "asc" }],
  });
};

/** READ (단건) */
export const findAnniversaryById = async (
  id: number,
  userId: number
) => {
  return prisma.anniversary.findFirst({
    where: { id, userId },
  });
};

/** UPDATE */
export const updateAnniversary = async (
  id: number,
  userId: number,
  data: {
    title?: string;
    month?: number;
    day?: number;
    color?: string;
  }
) => {
  return prisma.anniversary.updateMany({
    where: { id, userId },
    data,
  });
};

/** DELETE */
export const deleteAnniversary = async (
  id: number,
  userId: number
) => {
  return prisma.anniversary.deleteMany({
    where: { id, userId },
  });
};