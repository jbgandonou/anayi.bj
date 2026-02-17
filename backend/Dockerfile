FROM node:22-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma/
COPY backend/prisma.config.ts ./

RUN npm ci

COPY backend/ .

RUN npx prisma generate
RUN npm run build

# Production
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

RUN mkdir -p uploads

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
