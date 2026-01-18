import { IsOptional, IsInt, IsBoolean, IsPositive, IsNumber } from 'class-validator';

export class UpdateServicePriceDto {
  @IsOptional()
  @IsInt()
  serviceId?: number;

  @IsOptional()
  @IsInt()
  masterId?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationOverride?: number | null;
}