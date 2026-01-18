import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { CategoryModule } from 'src/category/category.module';
import { MasterModule } from 'src/master/master.module';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { MasterScheduleModule } from 'src/master-schedule/master-schedule.module';
import { ServicePriceModule } from 'src/service-price/service-price.module';
import { ServiceModule } from 'src/service/service.module';
import { AppointmentHistoryModule } from 'src/appointment-history/appointment-history.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [CategoryModule, MasterModule, AppointmentModule, MasterScheduleModule, ServicePriceModule, ServiceModule, AppointmentHistoryModule, UserModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
