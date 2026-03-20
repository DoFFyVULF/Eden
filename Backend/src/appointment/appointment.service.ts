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
      orderBy: { appointmentTime: 'desc' }
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

    const where: any = {
      appointmentTime: {
        gte: start,
        lte: end
      }
    };

    if (masterId !== undefined) {
      where.masterID = masterId;
    }

    return this.prisma.appointment.findMany({
      where,
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
      const masterId = dto.masterId ?? existing.masterID;
      const appointmentTime = dto.appointmentTime ?? existing.appointmentTime.toISOString();
      
      // Проверяем конфликты, исключая текущую запись и игнорируя отмененные/завершенные
      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          masterID: masterId,
          appointmentTime: new Date(appointmentTime),
          id: { not: id },
          status: {
            notIn: [AppointmentStatus.Отменен, AppointmentStatus.Завершен]
          }
        }
      });

      if (conflictingAppointment) {
        throw new BadRequestException(`На это время мастер уже занят другой записью`);
      }
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

  async complete(id: number) {
    await this.findOne(id);
    
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.Завершен
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

  async countActive() :Promise<number> {
    return this.prisma.appointment.count({
      where: {
        status: {
          in: [AppointmentStatus.Новый, AppointmentStatus.Подтвержден]
        }
      }
    })
  }

  private async ensureMasterExists(masterId: number) {
    const master = await this.prisma.master.findUnique({ where: { id: masterId } });
    if (!master) {
      throw new NotFoundException(`Мастер с ID ${masterId} не найден`);
    }
  }

  private async ensureServiceExists(serviceId: number) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId }
    });
    if (!service) {
      throw new NotFoundException(`Услуга с ID ${serviceId} не найдена`);
    }
  }

  private async ensureTimeNotTaken(masterId: number, time: string) {
    const existing = await this.prisma.appointment.findFirst({
      where: {
        masterID: masterId,
        appointmentTime: new Date(time),
        status: {
          notIn: [AppointmentStatus.Отменен, AppointmentStatus.Завершен]
        }
      }
    });

    if (existing) {
      throw new BadRequestException(`На ${time} мастер уже занят активной записью`);
    }
  }
}