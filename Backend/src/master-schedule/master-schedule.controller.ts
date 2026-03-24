/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode
} from '@nestjs/common';
import { MasterScheduleService } from './master-schedule.service';
import { MasterScheduleDto } from './dto/master-schedule.dto';
import { UpdateMasterScheduleDto } from './dto/update-master-schedule.dto';
import { MasterTimeOffDto } from './dto/master-time-off.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Auth()
@Controller('master-schedule')
export class MasterScheduleController {
  constructor(private readonly masterScheduleService: MasterScheduleService) {}

  @HttpCode(201)
  @Post()
  create(@Body() dto: MasterScheduleDto) {
    return this.masterScheduleService.create(dto);
  }

  @HttpCode(200)
  @Get()
  findAll() {
    return this.masterScheduleService.findAll();
  }

  @HttpCode(200)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.masterScheduleService.findOne(id);
  }

  @HttpCode(200)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMasterScheduleDto
  ) {
    return this.masterScheduleService.update(id, dto);
  }

  @HttpCode(200)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.masterScheduleService.remove(id);
  }

  // === Эндпоинты для отпусков ===

  @HttpCode(201)
  @Post(':masterId/time-off')
  createTimeOff(
    @Param('masterId', ParseIntPipe) masterId: number,
    @Body() dto: MasterTimeOffDto
  ) {
    return this.masterScheduleService.createTimeOff(masterId, dto);
  }

  @HttpCode(200)
  @Patch('time-off/:id')
  updateTimeOff(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MasterTimeOffDto
  ) {
    return this.masterScheduleService.updateTimeOff(id, dto);
  }

  @HttpCode(200)
  @Get(':masterId/time-off')
  getTimeOff(@Param('masterId', ParseIntPipe) masterId: number) {
    return this.masterScheduleService.getTimeOffForMaster(masterId);
  }

  @Get(':masterId/status')
  async getMasterStatus(@Param('masterId', ParseIntPipe) masterId: number) {
    return this.masterScheduleService.getMasterCurrentStatus(masterId);
  }

  @HttpCode(200)
  @Delete('time-off/:id')
  deleteTimeOff(@Param('id', ParseIntPipe) id: number) {
    return this.masterScheduleService.deleteTimeOff(id);
  }
}
