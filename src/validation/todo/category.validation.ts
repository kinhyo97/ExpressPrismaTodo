import { ApiError } from "../../utils/ApiError";

export const validateCategoryId = (id: number) =>
  Number.isNaN(id) &&
  (() => {
    throw new ApiError("INVALID_CATEGORY_ID");
  })();

export const validateCategoryName = (name?: string) =>
  (!name || !name.trim()) &&
  (() => {
    throw new ApiError("INVALID_CATEGORY_NAME");
  })();

export const validateCategoryNameLength = (name: string) =>
  name.length > 50 &&
  (() => {
    throw new ApiError("CATEGORY_NAME_TOO_LONG");
  })();

export const validateCategoryColor = (color?: string) =>
  (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) &&
  (() => {
    throw new ApiError("INVALID_CATEGORY_COLOR");
  })();
