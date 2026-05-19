FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app

# Define build-time and runtime environment variables for Prisma
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eden
ENV DATABASE_URL=$DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client and Build the App
RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts and Prisma schema/client from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/generated ./generated
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4200

# Run migrations and start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && node dist/src/main.js"]