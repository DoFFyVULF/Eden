import { IsInt, IsDateString, Min, Max } from 'class-validator';

export class MasterScheduleDto {
  @IsInt()
  masterId: number;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; 

  @IsDateString()
  startTime: string; 

  @IsDateString()
  endTime: string;
}
