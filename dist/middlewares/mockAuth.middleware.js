"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAuth = void 0;
// 모의 인증 미들웨어
const mockAuth = (req, res, next) => {
    // 로그인된 사용자라고 가정
    req.user = {
        id: 1,
        email: "test@test.com",
    };
    // 다음 미들웨어 또는 컨트롤러로 이동
    next();
};
exports.mockAuth = mockAuth;
//# sourceMappingURL=mockAuth.middleware.js.map