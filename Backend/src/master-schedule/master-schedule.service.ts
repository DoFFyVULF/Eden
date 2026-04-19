 
 
import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MasterScheduleDto } from './dto/master-schedule.dto';
import { UpdateMasterScheduleDto } from './dto/update-master-schedule.dto';
import { MasterTimeOffDto, TimeOffType } from './dto/master-time-off.dto';

export type MasterStatusInfo = {
  isOnTimeOff: boolean;
  currentPeriod: {
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    comment?: string;
  } | null;
};

@Injectable()
export class MasterScheduleService {
  constructor(private prisma: PrismaService) {}

  // === Рабочее расписание ===

  async create(dto: MasterScheduleDto) {
    await this.ensureMasterExists(dto.masterId);
    this.validateTime(dto.startTime, dto.endTime);

    return this.prisma.masterSchedule.create({
      data: {
        master: { connect: { id: dto.masterId } },
        dayOfWeek: dto.dayOfWeek ?? null,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime)
      },
      include: { master: true }
    });
  }

  async findAll() {
    return this.prisma.masterSchedule.findMany({
      include: { master: true },
      orderBy: { id: 'asc' }
    });
  }

  async findOne(id: number) {
    const schedule = await this.prisma.masterSchedule.findUnique({
      where: { id },
      include: { master: true }
    });

    if (!schedule) {
      throw new NotFoundException(`Расписание с ID ${id} не найдено`);
    }
    return schedule;
  }

  async update(id: number, dto: UpdateMasterScheduleDto) {
    await this.findOne(id);

    if (dto.masterId) {
      await this.ensureMasterExists(dto.masterId);
    }

    if (dto.startTime && dto.endTime) {
      this.validateTime(dto.startTime, dto.endTime);
    }

    return this.prisma.masterSchedule.update({
      where: { id },
      data: {
        master: dto.masterId ? { connect: { id: dto.masterId } } : undefined,
        dayOfWeek: dto.dayOfWeek ?? null,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined
      },
      include: { master: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.masterSchedule.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return this.prisma.masterSchedule.count();
  }

  // === Отпуска / Периоды недоступности ===

  async createTimeOff(masterId: number, dto: MasterTimeOffDto) {
    console.log('📥 [TimeOff] Запрос:', { masterId, dto });
    console.log('📥 [TimeOff] Dates received:', {
      startDate: dto.startDate,
      endDate: dto.endDate,
      startType: typeof dto.startDate,
      endType: typeof dto.endDate
    });

    await this.ensureMasterExists(masterId);
    
    // Validate dates before processing
    try {
      this.validateTimeOffDates(dto.startDate, dto.endDate);
    } catch (error) {
      console.error('❌ [TimeOff] Date validation failed:', error);
      throw error;
    }
    
    await this.checkOverlappingTimeOff(masterId, dto.startDate, dto.endDate);

    try {
      const result = await this.prisma.masterTimeOff.create({
        data: {
          master: { connect: { id: masterId } },
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          type: dto.type || TimeOffType.VACATION,
          comment: dto.comment
        },
        include: { master: true }
      });

      console.log('✅ [TimeOff] Создано ID:', result.id);
      return result;
    } catch (error) {
      console.error('❌ [TimeOff] Database error:', error);
      throw new BadRequestException('Failed to create time-off period');
    }
  }

  getTimeOffForMaster(masterId: number) {
    return this.prisma.masterTimeOff.findMany({
      where: { masterId },
      orderBy: { startDate: 'desc' }
    });
  }

  async deleteTimeOff(id: number) {
    const timeOff = await this.prisma.masterTimeOff.findUnique({
      where: { id }
    });

    if (!timeOff) {
      throw new NotFoundException(`Период недоступности с ID ${id} не найден`);
    }

    return this.prisma.masterTimeOff.delete({ where: { id } });
  }

  // === Новый метод: получение текущего статуса мастера ===
  async getMasterCurrentStatus(masterId: number): Promise<MasterStatusInfo> {
    const now = new Date();

    const currentPeriod = await this.prisma.masterTimeOff.findFirst({
      where: {
        masterId,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: { startDate: 'desc' }
    });

    if (currentPeriod) {
      return {
        isOnTimeOff: true,
        currentPeriod: {
          id: currentPeriod.id,
          type: currentPeriod.type,
          startDate: currentPeriod.startDate.toISOString(),
          endDate: currentPeriod.endDate.toISOString(),
          comment: currentPeriod.comment || undefined
        }
      };
    }

    return {
      isOnTimeOff: false,
      currentPeriod: null
    };
  }

  async updateTimeOff(id: number, dto: MasterTimeOffDto) {
    console.log('📥 [TimeOff] Update request:', { id, dto });

    const timeOff = await this.prisma.masterTimeOff.findUnique({
      where: { id }
    });

    if (!timeOff) {
      throw new NotFoundException(`Период недоступности с ID ${id} не найден`);
    }

    // Если переданы обе даты — валидируем
    let startDate: Date = timeOff.startDate;
    let endDate: Date = timeOff.endDate;

    if (dto.startDate) {
      startDate = new Date(dto.startDate);
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException('Некорректная дата начала');
      }
    }

    if (dto.endDate) {
      endDate = new Date(dto.endDate);
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException('Некорректная дата окончания');
      }
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        'Дата окончания должна быть позже даты начала'
      );
    }

    // Проверяем на пересечения с другими периодами (исключая текущий)
    const overlap = await this.prisma.masterTimeOff.findFirst({
      where: {
        masterId: timeOff.masterId,
        id: { not: id },
        OR: [
          { startDate: { lte: startDate }, endDate: { gte: startDate } },
          { startDate: { lte: endDate }, endDate: { gte: endDate } },
          { startDate: { gte: startDate }, endDate: { lte: endDate } }
        ]
      }
    });

    if (overlap) {
      throw new BadRequestException(
        'Период пересекается с другим существующим периодом'
      );
    }

    try {
      const result = await this.prisma.masterTimeOff.update({
        where: { id },
        data: {
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          type: dto.type ?? undefined,
          comment: dto.comment
        },
        include: { master: true }
      });

      console.log('✅ [TimeOff] Updated ID:', result.id);
      return result;
    } catch (error) {
      console.error('❌ [TimeOff] Update error:', error);
      throw new BadRequestException('Failed to update time-off period');
    }
  }

  // === Приватные методы ===

  private async ensureMasterExists(masterId: number) {
    const master = await this.prisma.master.findUnique({
      where: { id: masterId }
    });
    if (!master) {
      throw new NotFoundException(`Мастер с ID ${masterId} не найден`);
    }
  }

  private validateTime(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'startTime и endTime должны быть валидными ISO 8601 строками'
      );
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        'Время окончания должно быть позже времени начала'
      );
    }
  }

  private validateTimeOffDates(start: string, end: string) {
    try {
      const s = new Date(start);
      const e = new Date(end);
      
      console.log('Validating dates:', { start, end, s, e });
      
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        throw new BadRequestException(
          `Некорректные даты: start=${start}, end=${end}`
        );
      }
      
      if (e <= s) {
        throw new BadRequestException(
          'Дата окончания должна быть позже даты начала'
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Ошибка валидации дат: ${error.message}`
      );
    }
  }

  private async checkOverlappingTimeOff(
    masterId: number,
    start: string,
    end: string
  ) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const overlap = await this.prisma.masterTimeOff.findFirst({
      where: {
        masterId,
        OR: [
          { startDate: { lte: startDate }, endDate: { gte: startDate } },
          { startDate: { lte: endDate }, endDate: { gte: endDate } },
          { startDate: { gte: startDate }, endDate: { lte: endDate } }
        ]
      }
    });

    if (overlap) {
      throw new BadRequestException(
        'Этот период пересекается с другим отпуском или больничным'
      );
    }
  }
}