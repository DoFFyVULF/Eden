 
 
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  Query
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentDto } from './dto/appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AppointmentStatus } from 'generated/prisma/enums';


@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @HttpCode(201)
  @Post()
  create(@Body() dto: AppointmentDto) {
    return this.appointmentService.create(dto);
  }

  // GET /appointment?date=YYYY-MM-DD&masterId=1&status=Завершен
  @HttpCode(200)
  @Get()
  find(
    @Query('date') date?: string,
    @Query('masterId') masterId?: string,
    @Query('status') status?: AppointmentStatus
  ) {
    // Фильтр по статусу
    if (status) {
      return this.appointmentService.findByStatus(status);
    }

    // Фильтр по дате
    if (date) {
      return this.appointmentService.findByDate(
        date,
        masterId ? Number(masterId) : undefined
      );
    }

    // Все записи
    return this.appointmentService.findAll();
  }

  @Auth()
  @HttpCode(200)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.findOne(id);
  }

  @Auth()
  @HttpCode(200)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentDto
  ) {
    return this.appointmentService.update(id, dto);
  }

  @Auth()
  @HttpCode(200)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.remove(id);
  }
}
