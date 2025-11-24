import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  Length
} from 'class-validator';

export class ServiceDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @IsInt()
  @Min(1)
  duration: number; 

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsInt()
  categoryId: number; 
}
