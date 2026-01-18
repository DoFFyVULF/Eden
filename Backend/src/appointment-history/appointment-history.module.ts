import { Module } from '@nestjs/common';
import { AppointmentHistoryService } from './appointment-history.service';
import { AppointmentHistoryController } from './appointment-history.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AppointmentHistoryController],
  providers: [AppointmentHistoryService, PrismaService],
  exports: [AppointmentHistoryService],
})
export class AppointmentHistoryModule {}
