/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from 'src/stats/stats.controller';
import { CategoryService } from 'src/category/category.service';
import { ServicePriceService } from 'src/service-price/service-price.service';
import { MasterScheduleService } from 'src/master-schedule/master-schedule.service';
import { MasterService } from 'src/master/master.service';
import { AppointmentService } from 'src/appointment/appointment.service';
import { UserService } from 'src/user/user.service';
import { AppointmentHistoryService } from 'src/appointment-history/appointment-history.service';

describe('StatsController', () => {
  let controller: StatsController;
  let categoryService: CategoryService;
  let servicePriceService: ServicePriceService;
  let scheduleService: MasterScheduleService;
  let masterService: MasterService;
  let appointmentService: AppointmentService;
  let userService: UserService;
  let appointmentHistoryService: AppointmentHistoryService;

  const mockServices = {
    categoryService: { count: jest.fn() },
    servicePrice: { count: jest.fn() },
    scheduleService: { count: jest.fn() },
    masterService: { count: jest.fn() },
    appointmentService: { count: jest.fn(), countActive: jest.fn() },
    userService: { count: jest.fn() },
    appointmentHistoryService: { count: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        { provide: CategoryService, useValue: mockServices.categoryService },
        { provide: ServicePriceService, useValue: mockServices.servicePrice },
        { provide: MasterScheduleService, useValue: mockServices.scheduleService },
        { provide: MasterService, useValue: mockServices.masterService },
        { provide: AppointmentService, useValue: mockServices.appointmentService },
        { provide: UserService, useValue: mockServices.userService },
        { provide: AppointmentHistoryService, useValue: mockServices.appointmentHistoryService },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    categoryService = module.get<CategoryService>(CategoryService);
    servicePriceService = module.get<ServicePriceService>(ServicePriceService);
    scheduleService = module.get<MasterScheduleService>(MasterScheduleService);
    masterService = module.get<MasterService>(MasterService);
    appointmentService = module.get<AppointmentService>(AppointmentService);
    userService = module.get<UserService>(UserService);
    appointmentHistoryService = module.get<AppointmentHistoryService>(AppointmentHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCounts', () => {
    it('should return counts for all entities', async () => {
      mockServices.categoryService.count.mockResolvedValue(5);
      mockServices.servicePrice.count.mockResolvedValue(20);
      mockServices.scheduleService.count.mockResolvedValue(15);
      mockServices.masterService.count.mockResolvedValue(8);
      mockServices.appointmentService.count.mockResolvedValue(100);
      mockServices.userService.count.mockResolvedValue(10);
      mockServices.appointmentHistoryService.count.mockResolvedValue(50);
      mockServices.appointmentService.countActive.mockResolvedValue(25);

      const result = await controller.getCounts();

      expect(result).toEqual({
        category: 5,
        services: 20,
        schedule: 15,
        masters: 8,
        appointments: 100,
        users: 10,
        history: 50,
        activeAppointments: 25,
      });

      expect(mockServices.categoryService.count).toHaveBeenCalled();
      expect(mockServices.servicePrice.count).toHaveBeenCalled();
      expect(mockServices.scheduleService.count).toHaveBeenCalled();
      expect(mockServices.masterService.count).toHaveBeenCalled();
      expect(mockServices.appointmentService.count).toHaveBeenCalled();
      expect(mockServices.userService.count).toHaveBeenCalled();
      expect(mockServices.appointmentHistoryService.count).toHaveBeenCalled();
      expect(mockServices.appointmentService.countActive).toHaveBeenCalled();
    });

    it('should return zeros if all counts are empty', async () => {
      mockServices.categoryService.count.mockResolvedValue(0);
      mockServices.servicePrice.count.mockResolvedValue(0);
      mockServices.scheduleService.count.mockResolvedValue(0);
      mockServices.masterService.count.mockResolvedValue(0);
      mockServices.appointmentService.count.mockResolvedValue(0);
      mockServices.userService.count.mockResolvedValue(0);
      mockServices.appointmentHistoryService.count.mockResolvedValue(0);
      mockServices.appointmentService.countActive.mockResolvedValue(0);

      const result = await controller.getCounts();

      expect(result).toEqual({
        category: 0,
        services: 0,
        schedule: 0,
        masters: 0,
        appointments: 0,
        users: 0,
        history: 0,
        activeAppointments: 0,
      });
    });
  });
});
