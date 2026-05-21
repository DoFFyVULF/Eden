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

    const completedIds = appointments
      .filter((appt) => {
        const endTime = new Date(appt.appointmentTime);
        endTime.setMinutes(endTime.getMinutes() + appt.service.duration);
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
