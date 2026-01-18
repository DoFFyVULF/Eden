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
import { ServiceService } from './service.service';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Auth()
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @HttpCode(201)
  @Post()
  async create(@Body() dto: ServiceDto) {
    return this.serviceService.create(dto);
  }

  @HttpCode(200)
  @Get()
  async getAll() {
    return this.serviceService.getAll();
  }

  @HttpCode(200)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.getById(id);
  }

  @HttpCode(200)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto
  ) {
    return this.serviceService.update(id, dto);
  }

  @HttpCode(200)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.delete(id);
  }
}
