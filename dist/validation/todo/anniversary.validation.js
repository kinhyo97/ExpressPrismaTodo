"use strict";
/**
 * Anniversary Validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAnniversary = void 0;
const validateAnniversary = (month, day, color) => {
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
exports.validateAnniversary = validateAnniversary;
//# sourceMappingURL=anniversary.validation.js.map