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
const express_1 = require("express");
const todoController = __importStar(require("../controllers/todo.controller"));
const mockAuth_middleware_1 = require("../middlewares/mockAuth.middleware");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(mockAuth_middleware_1.mockAuth);
/** Todos */
router.get("/anniversaries", (0, asyncHandler_1.asyncHandler)(todoController.getAnniversaries));
router.get("/calendar", (0, asyncHandler_1.asyncHandler)(todoController.getCalendarData));
router.post("/", (0, asyncHandler_1.asyncHandler)(todoController.createTodo));
router.get("/", (0, asyncHandler_1.asyncHandler)(todoController.getTodos));
router.post("/range", (0, asyncHandler_1.asyncHandler)(todoController.createTodosByRange));
router.get("/range", (0, asyncHandler_1.asyncHandler)(todoController.getTodosByRange));
router.get("/recent", (0, asyncHandler_1.asyncHandler)(todoController.getRecentTodos));
router.get("/:id", (0, asyncHandler_1.asyncHandler)(todoController.getTodoById));
router.put("/:id", (0, asyncHandler_1.asyncHandler)(todoController.updateTodo));
router.patch("/:id", (0, asyncHandler_1.asyncHandler)(todoController.updateTodo));
router.patch("/:id/toggle", (0, asyncHandler_1.asyncHandler)(todoController.toggleTodo));
router.delete("/:id", (0, asyncHandler_1.asyncHandler)(todoController.deleteTodo));
/** aniversaries */
router.post("/anniversaries", (0, asyncHandler_1.asyncHandler)(todoController.createAnniversary));
router.put("/anniversaries/:id", (0, asyncHandler_1.asyncHandler)(todoController.updateAnniversary));
router.delete("/anniversaries/:id", (0, asyncHandler_1.asyncHandler)(todoController.deleteAnniversary));
exports.default = router;
//# sourceMappingURL=todo.routes.js.map