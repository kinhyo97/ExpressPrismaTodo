import { PrismaClient } from "@prisma/client";

// user mock data 생성
const prisma = new PrismaClient();

async function main() {
  // 이미 있으면 생성 안 함
  const existing = await prisma.user.findFirst({
    where: { email: "mock@test.com" },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: "mock@test.com",
      },
    });

    console.log("✅ mock user created");
  } else {
    console.log("ℹ️ mock user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
