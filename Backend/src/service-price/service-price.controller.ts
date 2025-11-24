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

@Controller('service-price')
export class ServicePriceController {
  constructor(private readonly servicePriceService: ServicePriceService) {}

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
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.servicePriceService.getById(id);
  }

  @HttpCode(200)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicePriceDto
  ) {
    return this.servicePriceService.update(id, dto);
  }

  @HttpCode(200)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.servicePriceService.delete(id);
  }
}
