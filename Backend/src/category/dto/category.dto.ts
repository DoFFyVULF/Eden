import {
  IsString,
  IsNotEmpty,
  Length,
  IsBoolean,
  IsOptional
} from 'class-validator';

export class CategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  title: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
