/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { Role } from 'generated/prisma/enums';
import { UserDto, ChangePasswordDto } from 'src/user/dto/user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    createByAdmin: jest.fn(),
    getAllAdmins: jest.fn(),
    getById: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call userService.createByAdmin', async () => {
      const dto: UserDto = {
        login: 'admin',
        password: 'pass',
        role: Role.admin,
      };
      // Добавим id, так как он обычно есть в ответе БД
      const result = { id: 1, ...dto };
      
      mockUserService.createByAdmin.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockUserService.createByAdmin).toHaveBeenCalledWith(dto);
    });
  });

  describe('me', () => {
    it('should return user without password', async () => {
      const user = {
        id: 1,
        login: 'test',
        password: 'secret',
        role: Role.admin,
        name: null,
        profileImg: null,
        masterId: null,
        isActive: true,
      };
      
      mockUserService.getById.mockResolvedValue(user);

      // Эмулируем вызов декоратора @CurrentUser('id')
      const result = await controller.me(1);

      // Проверяем, что вернулись правильные данные
      expect(result).toEqual({
        id: 1,
        login: 'test',
        role: Role.admin,
        name: null,
        profileImg: null,
        masterId: null,
        isActive: true,
        // password excluded
      });

      // TypeScript теперь не ругается, так как мы не обращаемся к result.password
      // Если нужно строго проверить отсутствие ключа, можно использовать:
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('changeMyPassword', () => {
    it('should call userService.changePassword with current user ID', async () => {
      const dto: ChangePasswordDto = { password: 'newpass' };
      const userId = 5;
      
      mockUserService.changePassword.mockResolvedValue({ success: true });

      await controller.changeMyPassword(userId, dto);

      expect(mockUserService.changePassword).toHaveBeenCalledWith(userId, dto);
    });
  });
  
  describe('resetPassword', () => {
      it('should call userService.changePassword with param ID', async () => {
          const dto: ChangePasswordDto = { password: 'newpass' };
          const idParam = '10';
          
          mockUserService.changePassword.mockResolvedValue({ success: true });
  
          await controller.resetPassword(idParam, dto);
  
          expect(mockUserService.changePassword).toHaveBeenCalledWith(10, dto);
      });
  });
});