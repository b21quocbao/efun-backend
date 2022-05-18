import { PartialType } from '@nestjs/swagger';
import { EventStatus } from '../enums/event-status.enum';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  status?: EventStatus;
}
