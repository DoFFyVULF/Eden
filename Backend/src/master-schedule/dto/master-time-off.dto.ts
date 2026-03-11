import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum TimeOffType {
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave',
  DAY_OFF = 'day_off',
  OTHER = 'other'
}

export class MasterTimeOffDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(TimeOffType)
  @IsOptional()
  type?: TimeOffType;

  @IsString()
  @IsOptional()
  comment?: string;
}