import { Controller } from '@nestjs/common';
import { AppointmentHistoryService } from './appointment-history.service';

@Controller('appointment-history')
export class AppointmentHistoryController {
  constructor(
    private readonly appointmentHistoryService: AppointmentHistoryService
  ) {}
  
}
