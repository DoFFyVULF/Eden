import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getServicesPageData() {
    const [services, activeMastersCount] = await Promise.all([
      this.prisma.service.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { id: 'asc' }
      }),
      this.prisma.master.count({
        where: { isActive: true }
      })
    ]);

    return {
      services,
      activeMastersCount
    };
  }

  async getAppointmentPageData() {
    const [categories, services, masters, prices, schedules] = await Promise.all([
      this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { title: 'asc' }
      }),
      this.prisma.service.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { id: 'asc' }
      }),
      this.prisma.master.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' }
      }),
      this.prisma.servicePrice.findMany({
        where: { isActive: true },
        include: { service: true, master: true },
        orderBy: { id: 'asc' }
      }),
      this.prisma.masterSchedule.findMany({
        include: { master: true },
        orderBy: { id: 'asc' }
      })
    ]);

    return {
      categories,
      services,
      masters,
      prices: prices.map((price) => ({
        ...price,
        price: Number(price.price),
        durationOverride:
          price.durationOverride != null ? Number(price.durationOverride) : null
      })),
      schedules
    };
  }
}
