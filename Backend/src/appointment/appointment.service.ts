import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AppointmentDto } from './dto/appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from 'generated/prisma/enums';
import { AppointmentStreamService } from './appointment-stream.service';

export interface PublicAppointmentMetadata {
  clientIp?: string;
  clientFingerprint?: string;
}

@Injectable()
export class AppointmentService {
  private static readonly PUBLIC_APPOINTMENT_LIMIT = 2;
  private static readonly PUBLIC_APPOINTMENT_WINDOW_MINUTES = 30;

  constructor(
    private prisma: PrismaService,
    private streamService: AppointmentStreamService
  ) {}

  async createPublic(
    dto: AppointmentDto,
    metadata: PublicAppointmentMetadata
  ) {
    await this.ensureMasterExists(dto.masterId);
    await this.ensureServiceExists(dto.serviceId);
    await this.ensurePublicBookingLimit(dto.clientPhone, metadata);
    await this.ensureTimeNotTaken(
      dto.masterId,
      dto.serviceId,
      dto.appointmentTime
    );

    return this.createAppointment(dto, metadata, true);
  }

  async createAdmin(dto: AppointmentDto) {
    await this.ensureMasterExists(dto.masterId);
    await this.ensureServiceExists(dto.serviceId);
    await this.ensureTimeNotTaken(
      dto.masterId,
      dto.serviceId,
      dto.appointmentTime
    );

    return this.createAppointment(dto, undefined, false);
  }

  private async createAppointment(
    dto: AppointmentDto,
    metadata?: PublicAppointmentMetadata,
    emitNotification = false
  ) {
    const normalizedPhone = this.normalizePhone(dto.clientPhone);
    const normalizedSurname = this.normalizePersonName(dto.clientSurname);
    const normalizedName = this.normalizePersonName(dto.clientName);
    const normalizedComment = this.normalizeComment(dto.comment);

    const newAppointment = await this.prisma.appointment.create({
      data: {
        clientSurname: normalizedSurname,
        clientName: normalizedName,
        clientPhone: normalizedPhone,
        comment: normalizedComment,
        clientIp: metadata?.clientIp,
        clientFingerprint: metadata?.clientFingerprint,
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

    if (emitNotification) {
      this.streamService.emitNewAppointment(newAppointment);
    }
    return newAppointment;
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
      },
      // Важно: на календаре нам не нужно показывать отмененные записи как "занятые"
      status: {
        notIn: [AppointmentStatus.Отменен]
      }
    };

    if (masterId !== undefined) {
      where.masterID = masterId;
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            duration: true
          }
        }
      },
      orderBy: {
        appointmentTime: 'asc'
      }
    });

    if (appointments.length === 0) {
      return appointments;
    }

    const masterIds = [...new Set(appointments.map((item) => item.masterID))];
    const serviceIds = [...new Set(appointments.map((item) => item.serviceId))];

    const servicePrices = await this.prisma.servicePrice.findMany({
      where: {
        masterID: { in: masterIds },
        serviceId: { in: serviceIds }
      },
      select: {
        masterID: true,
        serviceId: true,
        durationOverride: true
      }
    });

    const durationMap = new Map<string, number>();
    servicePrices.forEach((item) => {
      if (item.durationOverride == null) {
        return;
      }

      durationMap.set(
        `${item.masterID}-${item.serviceId}`,
        Number(item.durationOverride)
      );
    });

    return appointments.map((appointment) => {
      const duration =
        durationMap.get(`${appointment.masterID}-${appointment.serviceId}`) ??
        appointment.service.duration;

      return {
        ...appointment,
        service: {
          ...appointment.service,
          duration
        }
      };
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

    if (dto.appointmentTime || dto.masterId || dto.serviceId) {
      const masterId = dto.masterId ?? existing.masterID;
      const serviceId = dto.serviceId ?? existing.serviceId;
      const appointmentTime =
        dto.appointmentTime ?? existing.appointmentTime.toISOString();

      await this.ensureTimeNotTaken(masterId, serviceId, appointmentTime, id);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        clientSurname: dto.clientSurname
          ? this.normalizePersonName(dto.clientSurname)
          : undefined,
        clientName: dto.clientName
          ? this.normalizePersonName(dto.clientName)
          : undefined,
        clientPhone: dto.clientPhone
          ? this.normalizePhone(dto.clientPhone)
          : undefined,
        comment:
          dto.comment !== undefined
            ? this.normalizeComment(dto.comment)
            : undefined,
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

  async countActive(): Promise<number> {
    return this.prisma.appointment.count({
      where: {
        status: {
          in: [AppointmentStatus.Новый, AppointmentStatus.Подтвержден]
        }
      }
    });
  }

  private async ensureMasterExists(masterId: number) {
    const master = await this.prisma.master.findUnique({
      where: { id: masterId }
    });
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

  private async ensureTimeNotTaken(
    masterId: number,
    serviceId: number,
    time: string,
    excludeAppointmentId?: number
  ) {
    const requestedStart = new Date(time);
    const requestedDuration = await this.getAppointmentDurationMinutes(
      masterId,
      serviceId
    );
    const requestedEnd = new Date(
      requestedStart.getTime() + requestedDuration * 60 * 1000
    );

    const dayStart = new Date(requestedStart);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(requestedStart);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        masterID: masterId,
        appointmentTime: {
          gte: dayStart,
          lte: dayEnd
        },
        ...(excludeAppointmentId
          ? {
              id: { not: excludeAppointmentId }
            }
          : {}),
        status: {
          notIn: [AppointmentStatus.Отменен, AppointmentStatus.Завершен]
        }
      },
      include: {
        service: {
          select: {
            duration: true
          }
        }
      }
    });

    for (const appointment of existingAppointments) {
      const existingDuration = await this.getAppointmentDurationMinutes(
        appointment.masterID,
        appointment.serviceId,
        appointment.service.duration
      );
      const existingStart = new Date(appointment.appointmentTime);
      const existingEnd = new Date(
        existingStart.getTime() + existingDuration * 60 * 1000
      );

      if (requestedStart < existingEnd && requestedEnd > existingStart) {
        throw new BadRequestException(
          `На ${time} мастер уже занят активной записью`
        );
      }
    }
  }

  private async getAppointmentDurationMinutes(
    masterId: number,
    serviceId: number,
    fallbackDuration?: number
  ) {
    const servicePrice = await this.prisma.servicePrice.findFirst({
      where: {
        masterID: masterId,
        serviceId,
        isActive: true
      },
      select: {
        durationOverride: true
      }
    });

    if (servicePrice?.durationOverride != null) {
      return Number(servicePrice.durationOverride);
    }

    if (fallbackDuration != null) {
      return fallbackDuration;
    }

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true }
    });

    if (!service) {
      throw new NotFoundException(`Услуга с ID ${serviceId} не найдена`);
    }

    return service.duration;
  }

  private async ensurePublicBookingLimit(
    clientPhone: string,
    metadata: PublicAppointmentMetadata
  ) {
    const normalizedPhone = this.normalizePhone(clientPhone);
    const windowStart = new Date(
      Date.now() -
        AppointmentService.PUBLIC_APPOINTMENT_WINDOW_MINUTES * 60 * 1000
    );

    const [phoneCount, fingerprintCount, ipCount] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          clientPhone: normalizedPhone,
          createdAt: {
            gte: windowStart
          }
        }
      }),
      metadata.clientFingerprint
        ? this.prisma.appointment.count({
            where: {
              clientFingerprint: metadata.clientFingerprint,
              createdAt: {
                gte: windowStart
              }
            }
          })
        : Promise.resolve(0),
      metadata.clientIp
        ? this.prisma.appointment.count({
            where: {
              clientIp: metadata.clientIp,
              createdAt: {
                gte: windowStart
              }
            }
          })
        : Promise.resolve(0)
    ]);

    if (
      phoneCount < AppointmentService.PUBLIC_APPOINTMENT_LIMIT &&
      fingerprintCount < AppointmentService.PUBLIC_APPOINTMENT_LIMIT &&
      ipCount < AppointmentService.PUBLIC_APPOINTMENT_LIMIT
    ) {
      return;
    }

    const blockedBy = [
      phoneCount >= AppointmentService.PUBLIC_APPOINTMENT_LIMIT
        ? 'phone'
        : null,
      fingerprintCount >= AppointmentService.PUBLIC_APPOINTMENT_LIMIT
        ? 'fingerprint'
        : null,
      ipCount >= AppointmentService.PUBLIC_APPOINTMENT_LIMIT ? 'ip' : null
    ].filter(Boolean);

    throw new HttpException(
      {
        message:
          'Нельзя записаться больше 2-х раз за полчаса. Пожалуйста, позвоните администратору.',
        code: 'PUBLIC_APPOINTMENT_LIMIT_EXCEEDED',
        limit: AppointmentService.PUBLIC_APPOINTMENT_LIMIT,
        windowMinutes: AppointmentService.PUBLIC_APPOINTMENT_WINDOW_MINUTES,
        blockedBy
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }

  private normalizePhone(phone: string) {
    return phone.replace(/\D/g, '');
  }

  private normalizePersonName(value: string) {
    return value.trim().replace(/\s+/g, ' ');
  }

  private normalizeComment(comment?: string) {
    const normalized = comment?.trim();
    return normalized ? normalized : undefined;
  }
}
