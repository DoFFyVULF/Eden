import { PartialType } from '@nestjs/mapped-types';
import { MasterScheduleDto } from './master-schedule.dto';

export class UpdateMasterScheduleDto extends PartialType(MasterScheduleDto) {}
