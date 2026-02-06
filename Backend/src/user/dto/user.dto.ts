import { IsEnum, IsInt, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { Role } from 'generated/prisma/enums';

export class UserDto {
  @IsString()
  @Length(4, 20)
  login: string;

  @IsString()
  @Length(6, 50)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsInt()
  masterId?: number;

  @IsOptional()
  @IsString()
  name?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(50, { message: 'Пароль должен быть не более 50 символов' })
  password: string;
}