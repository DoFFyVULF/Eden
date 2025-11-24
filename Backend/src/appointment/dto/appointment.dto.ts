import {
  IsString,
  IsInt,
  IsDateString,
  IsEnum,
  IsOptional,
  Length,
  Matches
} from 'class-validator';
import { AppointmentStatus } from 'generated/prisma/enums';


export class AppointmentDto {
  @IsString()
  @Length(1, 50)
  clientSurname: string;

  @IsString()
  @Length(1, 50)
  clientName: string;

  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Телефон должен быть в формате +79991234567' })
  clientPhone: string;

  @IsInt()
  masterId: number;

  @IsInt()
  serviceId: number;

  @IsDateString()
  appointmentTime: string; // ISO date string

  @IsString()
  price: string; // decimal как строка (рекомендуется)

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
