import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../../src/auth/jwt.strategy';
import { UserService } from '../../src/user/user.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const configService = { get: jest.fn().mockReturnValue('secret') };
  const userService = { getById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: configService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and map user payload', async () => {
    userService.getById.mockResolvedValue({
      id: 1,
      name: 'Master',
      role: 'master',
      masterId: 10,
      isActive: true,
    });

    await expect(strategy.validate({ id: 1 })).resolves.toEqual({
      id: 1,
      name: 'Master',
      role: 'master',
      masterId: 10,
      isActive: true,
    });
  });

  it('should throw when user is not found', async () => {
    userService.getById.mockResolvedValue(null);

    await expect(strategy.validate({ id: 1 })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
