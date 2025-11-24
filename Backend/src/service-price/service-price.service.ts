/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ServicePriceDto } from './dto/service-price.dto';
import { UpdateServicePriceDto } from './dto/update-service-price.dto';

@Injectable()
export class ServicePriceService {
  constructor(private prisma: PrismaService) {}

  async getById(id: number) {
    const servicePrice = await this.prisma.servicePrice.findUnique({
      where: { id }
    });

    if (!servicePrice) {
      throw new NotFoundException(`Цена на услугу  с ID ${id} не найдена`);
    }

    return servicePrice;
  }

  async create(dto: ServicePriceDto) {
    const serviceExists = await this.prisma.service.findUnique({
      where: { id: dto.serviceId }
    });
    const masterExists = await this.prisma.master.findUnique({
      where: { id: dto.masterId }
    });

    if (!serviceExists) {
      throw new NotFoundException(`Услуга с ID ${dto.serviceId} не найдена`);
    }

    if (!masterExists) {
      throw new NotFoundException(`Мастер с ID ${dto.masterId} не найден`);
    }

    return this.prisma.servicePrice.create({
      data: {
        service: { connect: { id: dto.serviceId } },
        master: { connect: { id: dto.masterId } },
        price: dto.price,
        isActive: dto.isActive ?? true
      },
      include: { master: true, service: true }
    });
  }

async update(id: number, dto: UpdateServicePriceDto) {
  await this.getById(id);

  const data: any = {
    price: dto.price,
    isActive: dto.isActive
  };

  if (dto.serviceId) {
    data.service = { connect: { id: dto.serviceId } };
  }

  if (dto.masterId) {
    data.master = { connect: { id: dto.masterId } };
  }

  return this.prisma.servicePrice.update({
    where: { id },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    data,
    include: { master: true, service: true }
  });
}


  async getAll() {
    return this.prisma.servicePrice.findMany({
      include: { master: true, service: true },
      orderBy: { id: 'asc' }
    });
  }

  async delete(id: number) {
    await this.getById(id);
    return this.prisma.servicePrice.delete({ where: { id } });
  }
}
