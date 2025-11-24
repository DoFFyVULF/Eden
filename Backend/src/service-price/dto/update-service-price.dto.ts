import { PartialType } from '@nestjs/mapped-types';
import { ServicePriceDto } from './service-price.dto';


export class UpdateServicePriceDto extends PartialType(ServicePriceDto) {}
