"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLoggerMiddleware = void 0;
const logger_1 = require("../utils/logger");
const requestLoggerMiddleware = (req, _res, next) => {
    req.log = logger_1.logger.child({
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
    });
    next();
};
exports.requestLoggerMiddleware = requestLoggerMiddleware;
//# sourceMappingURL=requestLogger.middleware.js.map