import { PrismaClient } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { createDefaultAdmin } from './admin.seed';
import { seedData } from './data.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  await createDefaultAdmin(prisma as PrismaService);
  await seedData(prisma as PrismaService);
  console.log('Database seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
