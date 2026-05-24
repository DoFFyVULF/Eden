/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthDto } from 'src/auth/dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    getNewTokens: jest.fn(),
    logout: jest.fn(),
    addRefreshTokenToResponse: jest.fn(),
    removeRefreshTokenToResponse: jest.fn(),
    REFRESH_TOKEN_NAME: 'refreshToken'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and set refresh token cookie', async () => {
      const dto: AuthDto = { login: 'testuser', password: 'password123' };
      const loginResponse = {
        user: { id: 1, login: 'testuser' },
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      const mockRes = {
        cookie: jest.fn()
      } as never;

      const result = await controller.login(dto, mockRes);

      expect(result).toEqual({
        user: { id: 1, login: 'testuser' },
        accessToken: 'access_token'
      });
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(authService.addRefreshTokenToResponse).toHaveBeenCalledWith(
        mockRes,
        'refresh_token'
      );
    });
  });

  describe('getNewTokens', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const mockReq = {
        cookies: {
          refreshToken: 'valid_refresh_token'
        }
      } as never;

      const mockRes = {
        cookie: jest.fn()
      } as never;

      const tokensResponse = {
        user: { id: 1, login: 'testuser' },
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token'
      };

      mockAuthService.getNewTokens.mockResolvedValue(tokensResponse);

      const result = await controller.getNewTokens(mockReq, mockRes);

      expect(result).toEqual({
        user: { id: 1, login: 'testuser' },
        accessToken: 'new_access_token'
      });
      expect(authService.getNewTokens).toHaveBeenCalledWith(
        'valid_refresh_token'
      );
      expect(authService.addRefreshTokenToResponse).toHaveBeenCalledWith(
        mockRes,
        'new_refresh_token'
      );
    });

    it('should throw UnauthorizedException when refresh token is not present', async () => {
      const mockReq = {
        cookies: {}
      } as never;

      const mockRes = {
        cookie: jest.fn()
      } as never;

      await expect(controller.getNewTokens(mockReq, mockRes)).rejects.toThrow(
        UnauthorizedException
      );
      expect(authService.removeRefreshTokenToResponse).toHaveBeenCalledWith(
        mockRes
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh token cookie', async () => {
      const mockRes = {
        cookie: jest.fn()
      } as never;

      const result = await controller.logout(mockRes);

      expect(result).toBe(true);
      expect(authService.removeRefreshTokenToResponse).toHaveBeenCalledWith(
        mockRes
      );
    });
  });

  describe('me', () => {
    it('should return current user', () => {
      const user = { id: 1, login: 'testuser', role: 'admin' };

      const result = controller.me(user);

      expect(result).toEqual(user);
    });
  });
});
