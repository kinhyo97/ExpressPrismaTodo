

DB 반영 
npx prisma migrate reset --schema src/prisma/schema.prisma
npx prisma migrate dev --name add_todo_description --schema src/prisma/schema.prisma
npx prisma studio --schema src/prisma/schema.prisma
npm run dev

npx prisma migrate dev --name add_user_password_hash --schema=src/prisma/schema.prisma
node src/prisma/seed.js