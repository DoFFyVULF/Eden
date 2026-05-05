import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateScheduleSuggestionDto {
  @IsNumber()
  masterId: number;

  @IsNumber()
  @IsOptional()
  targetScheduleId?: number | null;

  @IsNumber()
  @IsOptional()
  dayOfWeek?: number | null; // null если это конкретная дата

  @IsDateString()
  @IsOptional()
  date?: string; // Если это разовая смена

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
