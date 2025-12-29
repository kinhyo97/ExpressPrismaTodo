"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnniversary = exports.updateAnniversary = exports.findAnniversaryById = exports.findAnniversaries = exports.createAnniversary = exports.deleteTodo = exports.toggleTodo = exports.updateTodo = exports.findRecentTodos = exports.findTodosByRange = exports.findTodoById = exports.findTodosByDate = exports.findMyTodos = exports.createTodosByRange = exports.createTodo = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../utils/logger");
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
function normalizeDate(d) {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
}
/** CREATE */
const createTodo = async (userId, title, date, categoryId) => {
    logger_1.logger.info(`Creating todo for user ${userId} with title: ${title}, date: ${date}, categoryId: ${categoryId}`);
    if (!title)
        throw new ApiError_1.ApiError("INVALID_TITLE");
    if (!date)
        throw new ApiError_1.ApiError("INVALID_TODO_DATE");
    return db_1.prisma.todo.create({
        data: {
            title,
            date: new Date(date),
            userId,
            categoryId,
        },
        include: categoryInclude,
    });
};
exports.createTodo = createTodo;
function parseDateUTC(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}
const createTodosByRange = async (userId, title, startDate, endDate, categoryId, reminderTime) => {
    const start = parseDateUTC(startDate);
    const end = parseDateUTC(endDate);
    if (start > end) {
        throw new ApiError_1.ApiError("INVALID_TODO_DATE");
    }
    const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    let count = 0;
    await db_1.prisma.$transaction(async (tx) => {
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
exports.createTodosByRange = createTodosByRange;
/** READ */
const findMyTodos = async (userId) => {
    logger_1.logger.info(`Finding todos for user ${userId}`);
    return db_1.prisma.todo.findMany({
        where: { userId },
        orderBy: { date: "asc" },
        include: categoryInclude,
    });
};
exports.findMyTodos = findMyTodos;
/** READ (DATE BASED) */
const findTodosByDate = async (userId, date) => {
    logger_1.logger.info(`Finding todos for user ${userId} on date ${date}`);
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    return db_1.prisma.todo.findMany({
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
exports.findTodosByDate = findTodosByDate;
// db 인스턴스 기반 transaction 처리
const findTodoById = async (db, todoId, userId) => {
    logger_1.logger.info(`Finding todo ${todoId} for user ${userId}`);
    const todo = await db.todo.findFirst({
        where: { id: todoId, userId },
    });
    if (!todo)
        throw new ApiError_1.ApiError("TODO_NOT_FOUND");
    return todo;
};
exports.findTodoById = findTodoById;
const findTodosByRange = async (prisma, userId, start, end) => {
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
exports.findTodosByRange = findTodosByRange;
const findRecentTodos = async (prisma, userId, limit) => {
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
exports.findRecentTodos = findRecentTodos;
/** UPDATE */
const updateTodo = async (todoId, userId, data) => {
    logger_1.logger.info(`Updating todo ${todoId} for user ${userId} with data: ${JSON.stringify(data)}`);
    // 🔥 PATCH 핵심: undefined 제거
    const updateData = {};
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
    logger_1.logger.info(`FINAL updateData: ${JSON.stringify(updateData)}`);
    if (Object.keys(updateData).length === 0) {
        logger_1.logger.warn("No fields to update");
        return db_1.prisma.todo.findUnique({
            where: { id: todoId, userId },
        });
    }
    return db_1.prisma.todo.update({
        where: { id: todoId, userId },
        data: updateData,
    });
};
exports.updateTodo = updateTodo;
/** TOGGLE */
const toggleTodo = async (todoId, userId) => {
    logger_1.logger.info(`Toggling todo ${todoId} for user ${userId}`);
    const todo = await db_1.prisma.todo.findFirst({
        where: { id: todoId, userId },
    });
    if (!todo) {
        throw new ApiError_1.ApiError("TODO_NOT_FOUND");
    }
    return db_1.prisma.todo.update({
        where: { id: todoId },
        data: { completed: !todo.completed },
    });
};
exports.toggleTodo = toggleTodo;
/** DELETE */
const deleteTodo = async (todoId, userId) => {
    logger_1.logger.info(`Deleting todo ${todoId} for user ${userId}`);
    try {
        return await db_1.prisma.todo.delete({
            where: {
                id: todoId,
                userId,
            },
        });
    }
    catch (e) {
        if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            e.code === "P2025") {
            throw new ApiError_1.ApiError("TODO_NOT_FOUND");
        }
        throw e;
    }
};
exports.deleteTodo = deleteTodo;
/* Anniversary 관련 서비스 함수들 */
/** CREATE */
const createAnniversary = async (userId, title, month, day, color) => {
    return db_1.prisma.anniversary.create({
        data: {
            title,
            month,
            day,
            color,
            userId,
        },
    });
};
exports.createAnniversary = createAnniversary;
/** READ (월별 / 전체) */
const findAnniversaries = async (userId, month) => {
    return db_1.prisma.anniversary.findMany({
        where: {
            userId,
            ...(month ? { month } : {}),
        },
        orderBy: [{ month: "asc" }, { day: "asc" }],
    });
};
exports.findAnniversaries = findAnniversaries;
/** READ (단건) */
const findAnniversaryById = async (id, userId) => {
    return db_1.prisma.anniversary.findFirst({
        where: { id, userId },
    });
};
exports.findAnniversaryById = findAnniversaryById;
/** UPDATE */
const updateAnniversary = async (id, userId, data) => {
    return db_1.prisma.anniversary.updateMany({
        where: { id, userId },
        data,
    });
};
exports.updateAnniversary = updateAnniversary;
/** DELETE */
const deleteAnniversary = async (id, userId) => {
    return db_1.prisma.anniversary.deleteMany({
        where: { id, userId },
    });
};
exports.deleteAnniversary = deleteAnniversary;
//# sourceMappingURL=todo.service.js.map