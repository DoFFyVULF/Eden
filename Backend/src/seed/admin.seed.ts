// src/seed/admin.seed.ts
import { PrismaService } from '../prisma.service';
import { hash } from 'argon2';

export async function createDefaultAdmin(prisma: PrismaService) {
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

  }
}
