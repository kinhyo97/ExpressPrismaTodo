import express from "express";
import todoRouter from "./routes/todo.routes";
import authRouter from "./routes/auth.routes";
import categoryRouter from "./routes/category.router";
import { errorHandler } from "./middlewares/error.middleware";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:19006",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
/* auth */
app.use("/auth", authRouter);
/* todos */
app.use("/todos", todoRouter);
/* categories */
app.use("/categories", categoryRouter);

app.get("/", (req, res) => {
  res.send("API Server Running");
});
app.use(errorHandler);

export default app;
