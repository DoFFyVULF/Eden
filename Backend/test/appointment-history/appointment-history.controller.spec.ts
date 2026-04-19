/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentHistoryController } from 'src/appointment-history/appointment-history.controller';
import { AppointmentHistoryService } from 'src/appointment-history/appointment-history.service';

describe('AppointmentHistoryController', () => {
  let controller: AppointmentHistoryController;
  let appointmentHistoryService: AppointmentHistoryService;

  const mockAppointmentHistoryService = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentHistoryController],
      providers: [
        {
          provide: AppointmentHistoryService,
          useValue: mockAppointmentHistoryService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentHistoryController>(AppointmentHistoryController);
    appointmentHistoryService = module.get<AppointmentHistoryService>(AppointmentHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
