import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  Length,
  Matches
} from 'class-validator';

export class MasterDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  surname: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  middlename: string; 

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  specialization: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be valid' })
  phone: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}