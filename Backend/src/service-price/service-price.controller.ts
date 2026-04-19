/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  HttpCode,
  ParseIntPipe
} from '@nestjs/common';
import { ServicePriceService } from './service-price.service';
import { ServicePriceDto } from './dto/service-price.dto';
import { UpdateServicePriceDto } from './dto/update-service-price.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';


@Controller('service-price')
export class ServicePriceController {
  constructor(private readonly servicePriceService: ServicePriceService) {}

  @Auth()
  @HttpCode(201)
  @Post()
  async create(@Body() dto: ServicePriceDto) {
    return this.servicePriceService.create(dto);
  }

  @HttpCode(200)
  @Get()
  async getAll() {
    return this.servicePriceService.getAll();
  }

  @HttpCode(200)
  @Get('master/:masterId')
  async getByMaster(@Param('masterId', ParseIntPipe) masterID: number) {
    return this.servicePriceService.getByMaster(masterID);
  }

  @HttpCode(200)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.servicePriceService.getById(id);
  }

  @Auth()
  @HttpCode(200)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicePriceDto
  ) {
    return this.servicePriceService.update(id, dto);
  }

  @HttpCode(200)
  @Get('average') // Маршрут будет /service-price/average
  async getAveragePrice() {
    return this.servicePriceService.getAveragePrice();
  }

  @Auth()
  @HttpCode(200)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.servicePriceService.delete(id);
  }
}
