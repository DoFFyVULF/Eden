import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  Length,
  Matches
} from 'class-validator';
import { AppointmentStatus } from 'generated/prisma/enums';

const PERSON_NAME_PATTERN = /^[A-Za-zА-Яа-яЁё]+(?:[ '-][A-Za-zА-Яа-яЁё]+)*$/u;

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  @Matches(PERSON_NAME_PATTERN, {
    message:
      'Фамилия может содержать только буквы, пробел, дефис или апостроф'
  })
  clientSurname?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @Matches(PERSON_NAME_PATTERN, {
    message:
      'Имя может содержать только буквы, пробел, дефис или апостроф'
  })
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
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'price must be a number with up to 2 decimal places' }
  )
  price?: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  comment?: string;
}
