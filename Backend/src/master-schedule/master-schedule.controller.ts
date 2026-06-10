 
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
  ForbiddenException
} from '@nestjs/common';
import { MasterScheduleService } from './master-schedule.service';
import { MasterScheduleDto } from './dto/master-schedule.dto';
import { UpdateMasterScheduleDto } from './dto/update-master-schedule.dto';
import { MasterTimeOffDto } from './dto/master-time-off.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateScheduleSuggestionDto } from './dto/schedule-suggestion.dto';
import { CurrentUser, CurrentUserPayload } from 'src/auth/decorators/user.decorator';
import { Role } from 'generated/prisma/client';


@Controller('master-schedule')
export class MasterScheduleController {
  constructor(private readonly masterScheduleService: MasterScheduleService) {}

  @Auth()
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

  @Auth()
  @HttpCode(200)
  @Get('suggestions')
  getSuggestions(@CurrentUser() user: CurrentUserPayload) {
    if (user.role === Role.admin) {
      return this.masterScheduleService.getSuggestions();
    }

    if (!user.masterId) {
      throw new ForbiddenException('Предложения доступны только мастеру');
    }

    return this.masterScheduleService.getSuggestions(user.masterId);
  }

  @Auth()
  @HttpCode(201)
  @Post('suggestions')
  createSuggestion(
    @Body() dto: CreateScheduleSuggestionDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    if (user.role === Role.master && user.masterId !== dto.masterId) {
      throw new ForbiddenException(
        'Можно создавать предложения только для своего расписания'
      );
    }

    return this.masterScheduleService.createSuggestion(dto);
  }

  @Auth()
  @HttpCode(200)
  @Patch('suggestions/:id/accept')
  acceptSuggestion(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload
  ) {
    if (user.role !== Role.admin) {
      throw new ForbiddenException(
        'Только администратор может принимать предложения'
      );
    }

    return this.masterScheduleService.acceptSuggestion(id);
  }

  @Auth()
  @HttpCode(200)
  @Patch('suggestions/:id/reject')
  rejectSuggestion(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload
  ) {
    if (user.role !== Role.admin) {
      throw new ForbiddenException(
        'Только администратор может отклонять предложения'
      );
    }

    return this.masterScheduleService.rejectSuggestion(id);
  }

  @HttpCode(200)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.masterScheduleService.findOne(id);
  }

  @Auth()
  @HttpCode(200)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMasterScheduleDto
  ) {
    return this.masterScheduleService.update(id, dto);
  }

  @Auth()
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

  @Auth()
  @HttpCode(200)
  @Delete('time-off/:id')
  deleteTimeOff(@Param('id', ParseIntPipe) id: number) {
    return this.masterScheduleService.deleteTimeOff(id);
  }
}
