import { Module } from '@nestjs/common';
import { MasterScheduleService } from './master-schedule.service';
import { MasterScheduleController } from './master-schedule.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [MasterScheduleController],
  providers: [MasterScheduleService, PrismaService],
  exports: [MasterScheduleService]
})
export class MasterScheduleModule {}
