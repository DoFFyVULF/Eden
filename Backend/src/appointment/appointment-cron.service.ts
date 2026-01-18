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

    for (const appt of appointments) {
      const endTime = new Date(appt.appointmentTime);
      endTime.setMinutes(endTime.getMinutes() + appt.service.duration);

      if (endTime < now) {
        await this.prisma.appointment.update({
          where: { id: appt.id },
          data: { status: AppointmentStatus.Завершен }
        });
      }
    }
  }
}
