import { Controller, Get } from '@nestjs/common';
import { CategoryService } from 'src/category/category.service';
import { ServiceService } from 'src/service/service.service';
import { MasterScheduleService } from 'src/master-schedule/master-schedule.service';
import { MasterService } from 'src/master/master.service';
import { AppointmentService } from 'src/appointment/appointment.service';
import { UserService } from 'src/user/user.service';
import { AppointmentHistoryService } from 'src/appointment-history/appointment-history.service';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly serviceService: ServiceService,
    private readonly scheduleService: MasterScheduleService,
    private readonly masterService: MasterService,
    private readonly appointmentService: AppointmentService,
    private readonly appointmentHistoryService: AppointmentHistoryService,
    private readonly userService: UserService,
  ) {}

  @Get('counts')
  async getCounts() {
    return {
      category: await this.categoryService.count(),
      services: await this.serviceService.count(),
      schedule: await this.scheduleService.count(),
      masters: await this.masterService.count(),
      appointments: await this.appointmentService.count(),
      users: await this.userService.count(),
      history: await this.appointmentHistoryService.count(),
    };
  }
}
