import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentHistoryDto } from './create-appointment-history.dto';

export class UpdateAppointmentHistoryDto extends PartialType(CreateAppointmentHistoryDto) {}
