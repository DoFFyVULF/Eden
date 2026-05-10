import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentEventsController } from './appointment-events.controller';
import { PrismaService } from 'src/prisma.service';
import { AppointmentCronService } from './appointment-cron.service';
import { AppointmentStreamService } from './appointment-stream.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [AppointmentController, AppointmentEventsController],
  providers: [AppointmentService, PrismaService, AppointmentCronService, AppointmentStreamService],
  exports: [AppointmentService]
})
export class AppointmentModule {}
