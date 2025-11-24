import { IsOptional } from 'class-validator';

export class UserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  login?: string;

  @IsOptional()
  password?: string;
}
