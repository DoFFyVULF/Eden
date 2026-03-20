import { Controller, Get } from '@nestjs/common';
import { CategoryService } from 'src/category/category.service';
import { ServicePriceService } from 'src/service-price/service-price.service';
import { MasterScheduleService } from 'src/master-schedule/master-schedule.service';
import { MasterService } from 'src/master/master.service';
import { AppointmentService } from 'src/appointment/appointment.service';
import { UserService } from 'src/user/user.service';
import { AppointmentHistoryService } from 'src/appointment-history/appointment-history.service';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly servicePrice: ServicePriceService,
    private readonly scheduleService: MasterScheduleService,
    private readonly masterService: MasterService,
    private readonly appointmentService: AppointmentService,
    private readonly appointmentHistoryService: AppointmentHistoryService,
    private readonly userService: UserService,
  ) {}

  @Get('counts')
  async getCounts() {
    // Execute all counts in parallel for better performance
    const [
      categoryCount,
      servicesCount,
      scheduleCount,
      mastersCount,
      appointmentsCount,
      usersCount,
      historyCount,
      activeAppointmentsCount
    ] = await Promise.all([
      this.categoryService.count(),
      this.servicePrice.count(),
      this.scheduleService.count(),
      this.masterService.count(),
      this.appointmentService.count(),
      this.userService.count(),
      this.appointmentHistoryService.count(),
      this.appointmentService.countActive(), // Fetch active count here
    ]);

    return {
      category: categoryCount,
      services: servicesCount,
      schedule: scheduleCount,
      masters: mastersCount,
      appointments: appointmentsCount,
      users: usersCount,
      history: historyCount,
      activeAppointments: activeAppointmentsCount, // Include it in the main response
    };
  }
  
}