FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
<<<<<<< HEAD
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
=======
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eden
ENV DATABASE_URL=$DATABASE_URL
>>>>>>> origin/new-public-design
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/generated ./generated
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 4200
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
