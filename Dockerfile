FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# TypeScript 빌드
RUN npm run build

EXPOSE 8080

# ❌ dev 금지
# CMD ["npm", "run", "dev"]

# ✅ 운영용 실행
CMD ["npm", "run", "start"]
