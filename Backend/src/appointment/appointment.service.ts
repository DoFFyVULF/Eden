import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AppointmentDto } from './dto/appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from 'generated/prisma/enums';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: AppointmentDto) {
    await this.ensureMasterExists(dto.masterId);
    await this.ensureServiceExists(dto.serviceId);

    await this.ensureTimeNotTaken(dto.masterId, dto.appointmentTime);

    return this.prisma.appointment.create({
      data: {
        clientSurname: dto.clientSurname,
        clientName: dto.clientName,
        clientPhone: dto.clientPhone,
        master: { connect: { id: dto.masterId } },
        service: { connect: { id: dto.serviceId } },
        appointmentTime: new Date(dto.appointmentTime),
        price: dto.price,
        status: dto.status ?? AppointmentStatus.Новый
      },
      include: {
        master: true,
        service: true
      }
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: { master: true, service: true },
      orderBy: { id: 'asc' }
    });
  }

  async findOne(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { master: true, service: true }
    });

    if (!appointment) {
      throw new NotFoundException(`Запись с ID ${id} не найдена`);
    }

    return appointment;
  }

  async findByDate(date: string, masterId?: number) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        appointmentTime: {
          gte: start,
          lte: end
        },
        ...(masterId !== undefined && { masterID: masterId })
      },
      include: {
        master: true,
        service: true
      },
      orderBy: {
        appointmentTime: 'asc'
      }
    });
  }

  async findByStatus(status: AppointmentStatus) {
    return this.prisma.appointment.findMany({
      where: { status },
      include: { master: true, service: true },
      orderBy: { appointmentTime: 'desc' }
    });
  }

  async update(id: number, dto: UpdateAppointmentDto) {
    const existing = await this.findOne(id);

    if (dto.masterId) {
      await this.ensureMasterExists(dto.masterId);
    }

    if (dto.serviceId) {
      await this.ensureServiceExists(dto.serviceId);
    }

    if (dto.appointmentTime || dto.masterId) {
      await this.ensureTimeNotTaken(
        dto.masterId ?? existing.masterID,
        dto.appointmentTime ?? existing.appointmentTime.toISOString()
      );
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        clientSurname: dto.clientSurname,
        clientName: dto.clientName,
        clientPhone: dto.clientPhone,
        master: dto.masterId ? { connect: { id: dto.masterId } } : undefined,
        service: dto.serviceId ? { connect: { id: dto.serviceId } } : undefined,
        appointmentTime: dto.appointmentTime
          ? new Date(dto.appointmentTime)
          : undefined,
        price: dto.price,
        status: dto.status
      },
      include: { master: true, service: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.appointment.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return this.prisma.appointment.count();
  }

  private async ensureMasterExists(masterId: number) {
    const m = await this.prisma.master.findUnique({ where: { id: masterId } });
    if (!m) {
      throw new NotFoundException(`Мастер с ID ${masterId} не найден`);
    }
  }

  private async ensureServiceExists(serviceId: number) {
    const s = await this.prisma.service.findUnique({
      where: { id: serviceId }
    });
    if (!s) {
      throw new NotFoundException(`Услуга с ID ${serviceId} не найдена`);
    }
  }

  private async ensureTimeNotTaken(masterId: number, time: string) {
    const existing = await this.prisma.appointment.findUnique({
      where: {
        masterID_appointmentTime: {
          masterID: masterId,
          appointmentTime: new Date(time)
        }
      }
    });

    if (existing) {
      throw new BadRequestException(`На ${time} мастер уже занят`);
    }
  }
}
