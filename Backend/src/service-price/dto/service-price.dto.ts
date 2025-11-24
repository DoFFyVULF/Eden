import { IsInt, IsPositive, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ServicePriceDto {
  @IsInt()
  @Type(() => Number)
  serviceId: number;

  @IsInt()
  @Type(() => Number)
  masterId: number;

  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
