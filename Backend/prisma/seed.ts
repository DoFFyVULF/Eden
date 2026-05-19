/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// Backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function main() {

  // Создаем админа, если его нет
  const existingAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        login: 'admin',
        password: await hash('admin123'),
        name: 'Администратор',
        role: 'admin',
        isActive: true,
      },
    });
    console.log('✅ Admin user created.');
  } else {
    console.log('ℹ️ Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });