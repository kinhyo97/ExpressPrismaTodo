/**
 * Anniversary Validation
 */

export const validateAnniversary = (
  month: number,
  day: number,
  color: string
) => {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Invalid month (1 ~ 12)");
  }

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error("Invalid day (1 ~ 31)");
  }

  if (typeof color !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error("Invalid color hex code");
  }
};
