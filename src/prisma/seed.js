const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("mockpassword", 10);

  await prisma.user.upsert({
    where: { email: "mock@test.com" },
    update: {},
    create: {
      email: "mock@test.com",
      passwordHash,
    },
  });

  console.log("✅ mock user ensured");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
