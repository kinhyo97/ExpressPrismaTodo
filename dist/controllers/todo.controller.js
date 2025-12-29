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
exports.getCalendarData = exports.deleteAnniversary = exports.updateAnniversary = exports.getAnniversaries = exports.createAnniversary = exports.deleteTodo = exports.toggleTodo = exports.updateTodo = exports.getRecentTodos = exports.getTodosByRange = exports.getTodoById = exports.getTodos = exports.createTodosByRange = exports.createTodo = void 0;
const todoService = __importStar(require("../services/todo.service"));
const logger_1 = require("../utils/logger");
const todo_validation_1 = require("../validation/todo/todo.validation");
const db_1 = require("../config/db");
const anniversary_validation_1 = require("../validation/todo/anniversary.validation");
/** CREATE */
const createTodo = async (req, res) => {
    const userId = req.user.id;
    const { title, date, categoryId } = req.body; // ⭐ 이 줄 핵심
    (0, todo_validation_1.validateTodoDate)(date);
    const todo = await todoService.createTodo(userId, title, date, categoryId ?? null);
    res.status(201).json(todo);
};
exports.createTodo = createTodo;
// 여러날 한번에 추가
const createTodosByRange = async (req, res) => {
    const userId = req.user.id;
    const { title, categoryId, startDate, endDate, reminderTime } = req.body;
    logger_1.logger.info(`createTodosByRange ${startDate} ~ ${endDate} for user ${userId}`);
    (0, todo_validation_1.validateTodoDate)(startDate);
    (0, todo_validation_1.validateTodoDate)(endDate);
    const count = await todoService.createTodosByRange(userId, title, startDate, endDate, categoryId ?? null, reminderTime ?? null);
    res.status(201).json({ count });
};
exports.createTodosByRange = createTodosByRange;
/** READ */
const getTodos = async (req, res) => {
    logger_1.logger.info(`Getting todos for user ${req.user.id}`);
    const userId = req.user.id;
    const { date } = req.query;
    const todos = date
        ? await todoService.findTodosByDate(userId, String(date))
        : await todoService.findMyTodos(userId);
    res.json(todos);
};
exports.getTodos = getTodos;
const getTodoById = async (req, res) => {
    logger_1.logger.info(`Getting todo by id: ${req.params.id} for user ${req.user.id}`);
    const userId = req.user.id;
    const todoId = Number(req.params.id);
    (0, todo_validation_1.validateTodoId)(todoId);
    // db 인스턴스 기반 transaction 처리
    const todo = await todoService.findTodoById(db_1.prisma, todoId, userId);
    res.json(todo);
};
exports.getTodoById = getTodoById;
const getTodosByRange = async (req, res) => {
    const userId = req.user.id;
    const { start, end } = req.query;
    logger_1.logger.info(`Getting todos by range: ${start} ~ ${end} for user ${userId}`);
    if (!start || !end) {
        throw new Error("start and end query params are required");
    }
    // 날짜 문자열 검증 (YYYY-MM-DD)
    const startDate = String(start);
    const endDate = String(end);
    const todos = await todoService.findTodosByRange(db_1.prisma, userId, startDate, endDate);
    res.json(todos);
};
exports.getTodosByRange = getTodosByRange;
const getRecentTodos = async (req, res) => {
    const userId = req.user.id;
    const limit = Number(req.query.limit ?? 3);
    logger_1.logger.info(`Getting recent ${limit} todos for user ${userId}`);
    const todos = await todoService.findRecentTodos(db_1.prisma, userId, limit);
    res.json(todos);
};
exports.getRecentTodos = getRecentTodos;
/** UPDATE */
const updateTodo = async (req, res) => {
    const userId = req.user.id;
    const { description, reminderTime } = req.body;
    const todoId = Number(req.params.id);
    const { title, completed } = req.body;
    console.log("===== UPDATE TODO CONTROLLER =====");
    console.log("req.params:", req.params);
    console.log("req.body:", req.body);
    console.log("req.user:", req.user);
    (0, todo_validation_1.validateTodoId)(todoId);
    const todo = await todoService.updateTodo(todoId, userId, {
        title,
        completed,
        description,
        reminderTime,
    });
    res.json(todo);
};
exports.updateTodo = updateTodo;
/** TOGGLE */
const toggleTodo = async (req, res) => {
    const userId = req.user.id;
    const todoId = Number(req.params.id);
    (0, todo_validation_1.validateTodoId)(todoId);
    const todo = await todoService.toggleTodo(todoId, userId);
    res.json(todo);
};
exports.toggleTodo = toggleTodo;
/** DELETE */
const deleteTodo = async (
// Req,res는 따로 정의 하고 router의 validator에서 검증
req, res, next) => {
    try {
        // userId와 todoId를 받아서 처리
        const userId = req.user.id;
        const todoId = Number(req.params.id);
        (0, todo_validation_1.validateTodoId)(todoId);
        await todoService.deleteTodo(todoId, userId);
        // void로 return하고 front에서 204 받아서 성공처리
        res.status(204).send();
    }
    catch (err) {
        // 에러를 컨트롤러에서 처리하지 않고 전역 에러 미들웨어로 전송
        next(err);
    }
};
exports.deleteTodo = deleteTodo;
/* Anniversary 관련 Controller */
/** CREATE */
const createAnniversary = async (req, res) => {
    const userId = req.user.id;
    const { title, month, day, color } = req.body;
    logger_1.logger.info(`Creating anniversary for user ${userId}`);
    (0, anniversary_validation_1.validateAnniversary)(month, day, color);
    const anniversary = await db_1.prisma.anniversary.create({
        data: {
            title,
            month,
            day,
            color,
            userId,
        },
    });
    res.status(201).json(anniversary);
};
exports.createAnniversary = createAnniversary;
/** READ (월별) */
const getAnniversaries = async (req, res) => {
    const userId = req.user.id;
    const month = Number(req.query.month);
    logger_1.logger.info(`Getting anniversaries for user ${userId}, month=${month || "all"}`);
    const anniversaries = await db_1.prisma.anniversary.findMany({
        where: {
            userId,
            ...(month ? { month } : {}),
        },
        orderBy: [{ month: "asc" }, { day: "asc" }],
    });
    res.json(anniversaries);
};
exports.getAnniversaries = getAnniversaries;
/** UPDATE */
const updateAnniversary = async (req, res) => {
    const userId = req.user.id;
    const id = Number(req.params.id);
    const { title, month, day, color } = req.body;
    logger_1.logger.info(`Updating anniversary ${id} for user ${userId}`);
    (0, anniversary_validation_1.validateAnniversary)(month, day, color);
    const anniversary = await db_1.prisma.anniversary.findFirst({
        where: { id, userId },
    });
    if (!anniversary) {
        return res.status(404).json({ message: "Anniversary not found" });
    }
    const updated = await db_1.prisma.anniversary.update({
        where: { id },
        data: {
            title,
            month,
            day,
            color,
        },
    });
    res.json(updated);
};
exports.updateAnniversary = updateAnniversary;
/** DELETE */
const deleteAnniversary = async (req, res) => {
    const userId = req.user.id;
    const id = Number(req.params.id);
    logger_1.logger.info(`Deleting anniversary ${id} for user ${userId}`);
    const anniversary = await db_1.prisma.anniversary.findFirst({
        where: { id, userId },
    });
    if (!anniversary) {
        return res.status(404).json({ message: "Anniversary not found" });
    }
    await db_1.prisma.anniversary.delete({
        where: { id },
    });
    res.status(204).send();
};
exports.deleteAnniversary = deleteAnniversary;
/** CALENDAR (Todo + Anniversary) */
const getCalendarData = async (req, res) => {
    const userId = req.user.id;
    const { start, end } = req.query;
    if (!start || !end) {
        throw new Error("start and end query params are required");
    }
    const startDate = String(start);
    const endDate = String(end);
    // Todo는 range 조회 (연도 개념 있음)
    const todos = await todoService.findTodosByRange(db_1.prisma, userId, startDate, endDate);
    // Anniversary는 전부 조회 (연도 개념 없음, 매년 반복)
    const anniversaries = await db_1.prisma.anniversary.findMany({
        where: { userId },
        orderBy: [{ month: "asc" }, { day: "asc" }],
    });
    res.json({
        todos,
        anniversaries,
    });
};
exports.getCalendarData = getCalendarData;
//# sourceMappingURL=todo.controller.js.map