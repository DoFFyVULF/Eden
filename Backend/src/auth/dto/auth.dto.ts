// src/auth/dto/auth.dto.ts
import { IsOptional, IsString, Length } from 'class-validator';

export class AuthDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString({ message: 'Логин должен быть строкой' })
  @Length(4, 20, { message: 'Логин должен содержать от 4 до 20 символов' })
  login: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(6, 50, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
}
