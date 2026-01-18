import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MasterScheduleDto } from './dto/master-schedule.dto';
import { UpdateMasterScheduleDto } from './dto/update-master-schedule.dto';

@Injectable()
export class MasterScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(dto: MasterScheduleDto) {
    await this.ensureMasterExists(dto.masterId);
    this.validateTime(dto.startTime, dto.endTime);

    // ✅ dayOfWeek может быть undefined — Prisma примет null
    return this.prisma.masterSchedule.create({
      data: {
        master: { connect: { id: dto.masterId } },
        dayOfWeek: dto.dayOfWeek ?? null, // явно null, если undefined
        startTime: new Date(dto.startTime), // ISO string → Date OK
        endTime: new Date(dto.endTime),
      },
      include: { master: true },
    });
  }

  async findAll() {
    return this.prisma.masterSchedule.findMany({
      include: { master: true },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const schedule = await this.prisma.masterSchedule.findUnique({
      where: { id },
      include: { master: true },
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
        dayOfWeek: dto.dayOfWeek ?? null, // ← важно: undefined → null
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
      include: { master: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.masterSchedule.delete({ where: { id } });
  }

   async count(): Promise<number> {
    return this.prisma.masterSchedule.count();
  }

  private async ensureMasterExists(masterId: number) {
    const master = await this.prisma.master.findUnique({ where: { id: masterId } });
    if (!master) {
      throw new NotFoundException(`Мастер с ID ${masterId} не найден`);
    }
  }

  private validateTime(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // ✅ Доп. защита от invalid date
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('startTime и endTime должны быть валидными ISO 8601 строками');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('Время окончания должно быть позже времени начала');
    }
  }
}