import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PrismaService } from 'src/prisma.service';
import { AppointmentCronService } from './appointment-cron.service';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, PrismaService, AppointmentCronService],
  exports: [AppointmentService]
})
export class AppointmentModule {}
