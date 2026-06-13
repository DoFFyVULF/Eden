FROM node:22-bookworm AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-bookworm AS build
WORKDIR /app
ARG DATABASE_URL=postgresql://postgres:postgres@postgres:5432/eden
ENV DATABASE_URL=$DATABASE_URL
# Openssl уже есть в bookworm (non-slim), не нужно apt-get
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig*.json nest-cli.json package*.json ./
COPY src ./src
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/generated ./generated
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 4200
CMD ["node", "dist/src/main.js"]
