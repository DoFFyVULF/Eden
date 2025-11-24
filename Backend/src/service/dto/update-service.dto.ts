import { PartialType } from '@nestjs/mapped-types';
import { ServiceDto } from './service.dto';

export class UpdateServiceDto extends PartialType(ServiceDto) {}
