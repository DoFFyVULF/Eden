import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsEnum,
  Length,
  Matches
} from 'class-validator';
import { AppointmentStatus } from 'generated/prisma/enums';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  clientSurname?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  clientName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Телефон должен быть в формате +79991234567' })
  clientPhone?: string;

  @IsOptional()
  @IsInt()
  masterId?: number;

  @IsOptional()
  @IsInt()
  serviceId?: number;

  @IsOptional()
  @IsDateString()
  appointmentTime?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
