// prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // seed: 'tsx prisma/seed.ts', // optional
  },
  datasource: {
    url: env("DATABASE_URL"), // ✅ Correct place in v7
    // shadowDatabaseUrl: env("SHADOW_DATABASE_URL"), // if needed
  },
})