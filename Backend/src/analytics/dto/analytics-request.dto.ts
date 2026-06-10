import { IsOptional, IsEnum, IsArray, IsDateString, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export class AnalyticsRequestDto {
  @ApiProperty({ enum: TimePeriod, default: TimePeriod.MONTH, required: false })
  @IsOptional()
  @IsEnum(TimePeriod)
  period?: TimePeriod = TimePeriod.MONTH;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Transform(({ value }) => normalizeNumberArray(value))
  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  masterIds?: number[];

  @Transform(({ value }) => normalizeNumberArray(value))
  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  serviceIds?: number[];
}

function normalizeNumberArray(value: unknown) {
  if (value == null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map((item) => Number(item));
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => Number(item));
  }

  return value;
}
