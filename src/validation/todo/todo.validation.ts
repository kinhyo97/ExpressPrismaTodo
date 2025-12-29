import { ApiError } from "../../utils/ApiError";

export const validateTodoId = (id: number) =>
  Number.isNaN(id) &&
  (() => {
    throw new ApiError("INVALID_TODO_ID");
  })();

export const validateTodoTitle = (title?: string) =>
  (!title || !title.trim()) &&
  (() => {
    throw new ApiError("INVALID_TITLE");
  })();

export const validateTodoTitleLength = (title: string) =>
  title.length > 100 &&
  (() => {
    throw new ApiError("TITLE_TOO_LONG");
  })();

export const validateTodoDate = (date: string) => {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError("INVALID_TODO_DATE");
  }
};