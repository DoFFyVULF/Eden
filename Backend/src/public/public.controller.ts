import { Controller, Get, Header, HttpCode } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @HttpCode(200)
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  @Get('services')
  getServicesPageData() {
    return this.publicService.getServicesPageData();
  }

  @HttpCode(200)
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  @Get('appointment')
  getAppointmentPageData() {
    return this.publicService.getAppointmentPageData();
  }
}
