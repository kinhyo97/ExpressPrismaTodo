"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcryptjs_1.default.hash("mockpassword", 10);
    await prisma.user.upsert({
        where: { email: "mock@test.com" },
        update: {},
        create: {
            email: "mock@test.com",
            passwordHash, // ⭐ 이 줄이 없으면 무조건 실패
        },
    });
    console.log("✅ mock user ensured");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map