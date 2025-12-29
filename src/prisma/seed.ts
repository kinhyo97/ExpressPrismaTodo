import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("mockpassword", 10);

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
