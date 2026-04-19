/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';
import { Role } from 'generated/prisma/enums';
import { UserDto, ChangePasswordDto } from 'src/user/dto/user.dto';
import * as argon2 from 'argon2';

// Мокаем argon2, чтобы он всегда возвращал предсказуемое значение
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_mock'),
}));

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockUser = {
    id: 1,
    login: 'testuser',
    password: 'hashed_password_mock',
    role: Role.admin,
    name: 'Test User',
    masterId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMaster = {
    id: 99,
    name: 'Master One',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            master: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getById', () => {
    it('should return a user by ID', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getById(1);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('createByAdmin', () => {
    const createUserDto: UserDto = {
      login: 'newuser',
      password: 'password123',
      role: Role.admin,
      name: 'New Admin',
    };

    it('should throw BadRequestException if user already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.createByAdmin(createUserDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException if role is MASTER but no masterId', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const masterDto: UserDto = {
        ...createUserDto,
        role: Role.master,
        masterId: undefined,
      };

      await expect(service.createByAdmin(masterDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException if role is ADMIN but masterId is provided', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const adminWithMasterDto: UserDto = {
        ...createUserDto,
        role: Role.admin,
        masterId: 99,
      };

      await expect(service.createByAdmin(adminWithMasterDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw NotFoundException if masterId is provided but master does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.master.findUnique as jest.Mock).mockResolvedValue(null);

      const masterDto: UserDto = {
        ...createUserDto,
        role: Role.master,
        masterId: 99,
      };

      await expect(service.createByAdmin(masterDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should create a user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.createByAdmin(createUserDto);

      expect(result).toEqual(mockUser);
      expect(argon2.hash).toHaveBeenCalledWith('password123');
      
      // Исправлено: добавлен ключ data:
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          login: createUserDto.login,
          password: 'hashed_password_mock',
          role: createUserDto.role,
          name: createUserDto.name,
          masterId: null,
          isActive: true,
        },
      });
    });
    
    it('should create a master user successfully with valid masterId', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.master.findUnique as jest.Mock).mockResolvedValue(mockMaster);
        (prisma.user.create as jest.Mock).mockResolvedValue({ ...mockUser, role: Role.master, masterId: 99 });
  
        const masterDto: UserDto = {
          login: 'masteruser',
          password: 'password123',
          role: Role.master,
          masterId: 99,
        };
  
        const result = await service.createByAdmin(masterDto);
  
        expect(result.role).toBe(Role.master);
        expect(result.masterId).toBe(99);
        expect(prisma.master.findUnique).toHaveBeenCalledWith({ where: { id: 99 } });
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      password: 'newpassword123',
    };

    it('should throw NotFoundException if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.changePassword(1, changePasswordDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should update password successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Мок обновления возвращает объект с тем хешем, который вернул argon2
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'hashed_password_mock', 
      });

      const result = await service.changePassword(1, changePasswordDto);

      // 1. Проверяем, что результат содержит замоканый хеш
      expect(result.password).toBe('hashed_password_mock');
      
      // 2. Проверяем, что argon2 был вызван с правильным исходным паролем
      expect(argon2.hash).toHaveBeenCalledWith('newpassword123');
      
      // 3. Исправляем ожидание вызова Prisma: туда должен уйти результат работы argon2
      // Исправлено: добавлен ключ data:
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'hashed_password_mock' },
      });
    });
  });

  describe('getAllMasters & getAllAdmins', () => {
      it('should return all masters', async () => {
          const masters = [{ ...mockUser, role: Role.master }];
          (prisma.user.findMany as jest.Mock).mockResolvedValue(masters);
          
          const result = await service.getAllMasters();
          expect(result).toEqual(masters);
          expect(prisma.user.findMany).toHaveBeenCalledWith({ where: { role: Role.master } });
      });

      it('should return all admins', async () => {
          const admins = [{ ...mockUser, role: Role.admin }];
          (prisma.user.findMany as jest.Mock).mockResolvedValue(admins);
          
          const result = await service.getAllAdmins();
          expect(result).toEqual(admins);
          expect(prisma.user.findMany).toHaveBeenCalledWith({ where: { role: Role.admin } });
      });
  });

  describe('delete', () => {
      it('should delete a user', async () => {
          (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);
          
          const result = await service.delete(1);
          expect(result).toEqual(mockUser);
          expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      });
  });
});