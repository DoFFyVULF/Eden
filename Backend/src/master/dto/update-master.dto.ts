import { PartialType } from '@nestjs/mapped-types';
import { MasterDto } from './master.dto';

export class UpdateMasterDto extends PartialType(MasterDto) {}
