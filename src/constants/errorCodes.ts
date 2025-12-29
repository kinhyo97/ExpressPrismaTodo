export const ERROR_CODES = {
  INVALID_TODO_ID: {
    status: 400,
    message: "Invalid todo id",
  },
  INVALID_TITLE: {
    status: 400,
    message: "Title is required",
  },
  TITLE_TOO_LONG: {
    status: 400,
    message: "Title is too long",
  },

  TODO_NOT_FOUND: {
    status: 404,
    message: "Todo not found",
  },
  FORBIDDEN_TODO_ACCESS: {
    status: 403,
    message: "You do not have permission to access this todo",
  },

  INVALID_TODO_DATE: {
    status: 400,
    message: "Invalid todo date",
  },

  TODO_ALREADY_COMPLETED: {
    status: 409,
    message: "Todo is already completed",
  },

  TODO_CREATE_FAILED: {
    status: 500,
    message: "Failed to create todo",
  },
  TODO_UPDATE_FAILED: {
    status: 500,
    message: "Failed to update todo",
  },
  TODO_DELETE_FAILED: {
    status: 500,
    message: "Failed to delete todo",
  },
  
  /* ===== Category ===== */
  INVALID_CATEGORY_ID: {
    status: 400,
    message: "Invalid category id",
  },
  INVALID_CATEGORY_NAME: {
    status: 400,
    message: "Category name is required",
  },
  CATEGORY_NAME_TOO_LONG: {
    status: 400,
    message: "Category name is too long",
  },
  INVALID_CATEGORY_COLOR: {
    status: 400,
    message: "Invalid category color",
  },
  CATEGORY_NOT_FOUND: {
    status: 404,
    message: "Category not found",
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
