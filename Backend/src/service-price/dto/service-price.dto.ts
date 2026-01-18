import { IsInt, IsPositive, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class ServicePriceDto {
  @IsInt()
  serviceId: number;

  @IsInt()
  masterId: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationOverride?: number | null;
}