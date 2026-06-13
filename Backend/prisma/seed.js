const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAdmin() {
  const existing = await prisma.user.findFirst({
    where: { role: 'admin' },
  });
  if (!existing) {
    await prisma.user.create({
      data: {
        login: 'admin',
        password: await argon2.hash('admin123'),
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
