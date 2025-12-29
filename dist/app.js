"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const todo_routes_1 = __importDefault(require("./routes/todo.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const category_router_1 = __importDefault(require("./routes/category.router"));
const error_middleware_1 = require("./middlewares/error.middleware");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:8081",
        "http://localhost:19006",
    ],
    credentials: true,
}));
app.use(express_1.default.json());
/* auth */
app.use("/auth", auth_routes_1.default);
/* todos */
app.use("/todos", todo_routes_1.default);
/* categories */
app.use("/categories", category_router_1.default);
app.get("/", (req, res) => {
    res.send("API Server Running");
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map