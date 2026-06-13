/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function seedAdmin() {
  const existing = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!existing) {
    await prisma.user.create({
      data: {
        login: 'admin',
        password: await hash('admin123'),
        name: 'Администратор',
        role: 'admin',
        isActive: true,
      },
    });
    console.log('✅ Admin user created');
  } else {
    console.log('⏭️ Admin user already exists, skipping');
  }
}

async function main() {
  console.log('🌱 Starting admin seed...');
  await seedAdmin();
  console.log('🎉 Admin seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
