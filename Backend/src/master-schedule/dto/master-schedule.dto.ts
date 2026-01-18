// src/master-schedule/dto/master-schedule.dto.ts
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class MasterScheduleDto {
  @IsNumber()
  masterId: number;

  @IsNumber()
  @IsOptional() // ← обязательно!
  dayOfWeek?: number;

  @IsString()
  startTime: string; // ISO 8601

  @IsString()
  endTime: string;
}