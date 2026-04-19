/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { AuthDto } from 'src/auth/dto/auth.dto';
import * as argon2 from 'argon2';

jest.mock('argon2', () => ({
  verify: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    login: 'testuser',
    password: 'hashed_password',
    role: 'admin',
    name: 'Test User',
    isActive: true,
  };

  const mockAuthDto: AuthDto = {
    login: 'testuser',
    password: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            getByLogin: jest.fn(),
            getById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_jwt_token'),
            verifyAsync: jest.fn().mockResolvedValue({ id: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return user and tokens on valid login', async () => {
      (userService.getByLogin as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('mock_jwt_token');

      const result = await service.login(mockAuthDto);

      expect(result).toEqual({
        user: { id: 1, login: 'testuser', role: 'admin', name: 'Test User', isActive: true },
        accessToken: 'mock_jwt_token',
        refreshToken: 'mock_jwt_token',
      });
      expect(userService.getByLogin).toHaveBeenCalledWith('testuser');
      expect(argon2.verify).toHaveBeenCalledWith('hashed_password', 'password123');
    });

    it('should throw NotFoundException if user not found', async () => {
      (userService.getByLogin as jest.Mock).mockResolvedValue(null);

      await expect(service.login(mockAuthDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if password is invalid', async () => {
      (userService.getByLogin as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(mockAuthDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getNewTokens', () => {
    it('should return new tokens on valid refresh token', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ id: 1 });
      (userService.getById as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('mock_jwt_token');

      const result = await service.getNewTokens('valid_refresh_token');

      expect(result).toEqual({
        user: { id: 1, login: 'testuser', role: 'admin', name: 'Test User', isActive: true },
        accessToken: 'mock_jwt_token',
        refreshToken: 'mock_jwt_token',
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(service.getNewTokens('invalid_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ id: 1 });
      (userService.getById as jest.Mock).mockResolvedValue(null);

      await expect(service.getNewTokens('valid_token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('addRefreshTokenToResponse', () => {
    it('should set refresh token cookie', () => {
      const mockRes = {
        cookie: jest.fn(),
      } as any;

      service.addRefreshTokenToResponse(mockRes, 'refresh_token_123');

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token_123',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      );
    });
  });

  describe('removeRefreshTokenToResponse', () => {
    it('should clear refresh token cookie', () => {
      const mockRes = {
        cookie: jest.fn(),
      } as any;

      service.removeRefreshTokenToResponse(mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        '',
        expect.objectContaining({
          httpOnly: true,
          expires: expect.any(Date),
          path: '/',
        })
      );
    });
  });
});
