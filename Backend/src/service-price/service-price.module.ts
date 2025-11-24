import { Module } from '@nestjs/common';
import { ServicePriceService } from './service-price.service';
import { ServicePriceController } from './service-price.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ServicePriceController],
  providers: [ServicePriceService, PrismaService],
})
export class ServicePriceModule {}
