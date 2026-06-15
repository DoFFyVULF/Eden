import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppointmentStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AppointmentCronService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async completeAppointments() {
    const now = new Date();

    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: {
          in: [AppointmentStatus.Новый, AppointmentStatus.Подтвержден]
        }
      },
      include: {
        service: true
      }
    });

    const masterIds = [...new Set(appointments.map((a) => a.masterID))];
    const serviceIds = [...new Set(appointments.map((a) => a.serviceId))];

    const servicePrices = await this.prisma.servicePrice.findMany({
      where: {
        masterID: { in: masterIds },
        serviceId: { in: serviceIds },
        isActive: true,
        durationOverride: { not: null }
      },
      select: {
        masterID: true,
        serviceId: true,
        durationOverride: true
      }
    });

    const durationMap = new Map<string, number>();
    for (const sp of servicePrices) {
      durationMap.set(`${sp.masterID}-${sp.serviceId}`, sp.durationOverride!);
    }

    const completedIds = appointments
      .filter((appt) => {
        const effectiveDuration = durationMap.get(`${appt.masterID}-${appt.serviceId}`) ?? appt.service.duration;
        const endTime = new Date(appt.appointmentTime);
        endTime.setMinutes(endTime.getMinutes() + effectiveDuration);
        return endTime < now;
      })
      .map((appt) => appt.id);

    if (completedIds.length > 0) {
      await this.prisma.appointment.updateMany({
        where: { id: { in: completedIds } },
        data: { status: AppointmentStatus.Завершен }
      });
    }
  }
}
