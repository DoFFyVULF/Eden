/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  Query,
  ForbiddenException,
  Headers,
  Req
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentDto } from './dto/appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AppointmentStatus } from 'generated/prisma/enums';
import { CurrentUser, CurrentUserPayload } from 'src/auth/decorators/user.decorator';
import { Role } from 'generated/prisma/client';
import { Request } from 'express';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @HttpCode(201)
  @Post('public')
  createPublic(
    @Body() dto: AppointmentDto,
    @Req() request: Request,
    @Headers('x-client-fingerprint') clientFingerprint?: string
  ) {
    return this.appointmentService.createPublic(dto, {
      clientIp: this.extractClientIp(request),
      clientFingerprint: this.normalizeFingerprint(clientFingerprint)
    });
  }

  @Auth()
  @HttpCode(201)
  @Post('admin')
  createAdmin(
    @Body() dto: AppointmentDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    if (user.role !== Role.admin) {
      throw new ForbiddenException('Только администратор может создавать записи через этот маршрут');
    }

    return this.appointmentService.createAdmin(dto);
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

  private extractClientIp(request: Request) {
    const xForwardedFor = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];

    const rawIp = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : typeof xForwardedFor === 'string'
        ? xForwardedFor.split(',')[0]
        : typeof xRealIp === 'string'
          ? xRealIp
          : request.ip;

    return rawIp?.trim().replace('::ffff:', '') || undefined;
  }

  private normalizeFingerprint(fingerprint?: string) {
    const normalized = fingerprint?.trim();

    return normalized ? normalized.slice(0, 128) : undefined;
  }
}
