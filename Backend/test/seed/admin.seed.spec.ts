jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

import { createDefaultAdmin } from '../../src/seed/admin.seed';

describe('createDefaultAdmin', () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create admin when it does not exist', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await createDefaultAdmin(prisma as never);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        login: 'admin',
        password: 'hashed-password',
        name: 'Администратор',
        role: 'admin',
        isActive: true,
      },
    });
  });

  it('should not create admin when it already exists', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 1 });

    await createDefaultAdmin(prisma as never);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
