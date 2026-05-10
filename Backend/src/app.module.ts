import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MasterModule } from './master/master.module';
import { CategoryModule } from './category/category.module';
import { ServiceModule } from './service/service.module';
import { ServicePriceModule } from './service-price/service-price.module';
import { MasterScheduleModule } from './master-schedule/master-schedule.module';
import { AppointmentModule } from './appointment/appointment.module';
import { StatsModule } from './stats/stats.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppointmentHistoryModule } from './appointment-history/appointment-history.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    MasterModule,
    CategoryModule,
    ServiceModule,
    ServicePriceModule,
    MasterScheduleModule,
    AppointmentModule,
    StatsModule,
    ScheduleModule.forRoot(),
    AppointmentHistoryModule,
    AnalyticsModule,

  ]
})
export class AppModule {}
