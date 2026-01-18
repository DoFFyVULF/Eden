import { IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';
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
