import { Router } from "express";
import * as todoController from "../controllers/todo.controller";
import { mockAuth } from "../middlewares/mockAuth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

/** Todos */
router.get("/anniversaries", asyncHandler(todoController.getAnniversaries));
router.get("/calendar", asyncHandler(todoController.getCalendarData));

router.post("/", asyncHandler(todoController.createTodo));
router.get("/", asyncHandler(todoController.getTodos));
router.post("/range", asyncHandler(todoController.createTodosByRange));

router.get("/range", asyncHandler(todoController.getTodosByRange));
router.get("/recent", asyncHandler(todoController.getRecentTodos));

router.delete("/all", asyncHandler(todoController.deleteAllTodos));

router.get("/:id", asyncHandler(todoController.getTodoById));
router.put("/:id", asyncHandler(todoController.updateTodo));
router.patch("/:id", asyncHandler(todoController.updateTodo));
router.patch("/:id/toggle", asyncHandler(todoController.toggleTodo));
router.delete("/:id", asyncHandler(todoController.deleteTodo));


/** aniversaries */
router.post("/anniversaries", asyncHandler(todoController.createAnniversary));
router.put("/anniversaries/:id", asyncHandler(todoController.updateAnniversary));
router.delete("/anniversaries/:id", asyncHandler(todoController.deleteAnniversary));

export default router;
