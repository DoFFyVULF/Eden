import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';
import { createDefaultAdmin } from './admin.seed';

const prisma = new PrismaClient();

async function main() {
  await createDefaultAdmin(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
