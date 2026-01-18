import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AppointmentHistoryService {
  constructor(private readonly prisma: PrismaService) {}
  async count(): Promise<number> {
    return this.prisma.appointmentHistory.count();
  }
}
