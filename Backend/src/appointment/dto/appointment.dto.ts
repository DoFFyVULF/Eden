import {
  IsString,
  IsInt,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';
import { AppointmentStatus } from 'generated/prisma/enums';

const PERSON_NAME_PATTERN = /^[A-Za-zА-Яа-яЁё]+(?:[ '-][A-Za-zА-Яа-яЁё]+)*$/u;

export class AppointmentDto {
  @IsString()
  @Length(1, 50)
  @Matches(PERSON_NAME_PATTERN, {
    message:
      'Фамилия может содержать только буквы, пробел, дефис или апостроф'
  })
  clientSurname: string;

  @IsString()
  @Length(1, 50)
  @Matches(PERSON_NAME_PATTERN, {
    message:
      'Имя может содержать только буквы, пробел, дефис или апостроф'
  })
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

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'price must be a number with up to 2 decimal places' }
  )
  price: number;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  comment?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
