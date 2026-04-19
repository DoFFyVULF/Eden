/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { MasterUserController } from 'src/user/master.controller';
import { UserService } from 'src/user/user.service';
import { Role } from 'generated/prisma/enums';
import { UserDto, ChangePasswordDto } from 'src/user/dto/user.dto';

describe('MasterUserController', () => {
  let controller: MasterUserController;
  let userService: UserService;

  const mockUserService = {
    createByAdmin: jest.fn(),
    getAllMasters: jest.fn(),
    delete: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasterUserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<MasterUserController>(MasterUserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should force role to MASTER and call createByAdmin', async () => {
      const inputDto: UserDto = {
        login: 'master1',
        password: 'pass',
        role: Role.admin, // Даже если пришло admin, контроллер должен исправить
        masterId: 5,
      };
      
      const expectedDto = {
        ...inputDto,
        role: Role.master,
      };

      mockUserService.createByAdmin.mockResolvedValue({ id: 1, ...expectedDto });

      await controller.create(inputDto);

      expect(mockUserService.createByAdmin).toHaveBeenCalledWith(expectedDto);
    });
  });

  describe('getAll', () => {
    it('should return all masters', async () => {
      const masters = [{ id: 1, login: 'm1' }];
      mockUserService.getAllMasters.mockResolvedValue(masters);

      expect(await controller.getAll()).toBe(masters);
      expect(mockUserService.getAllMasters).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete master by ID', async () => {
      mockUserService.delete.mockResolvedValue(undefined);

      await controller.delete('5');

      expect(mockUserService.delete).toHaveBeenCalledWith(5);
    });
  });
  
  describe('changeMasterPassword', () => {
      it('should change password for specific master', async () => {
          const dto: ChangePasswordDto = { password: 'new' };
          mockUserService.changePassword.mockResolvedValue({});
          
          await controller.changeMasterPassword('7', dto);
          
          expect(mockUserService.changePassword).toHaveBeenCalledWith(7, dto);
      });
  });
});