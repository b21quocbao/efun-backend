import { PartialType } from '@nestjs/swagger';
import { EventStatus } from '../enums/event-status.enum';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  status?: EventStatus;
  userId?: number;
  result?: string;
  isBlock?: boolean;
  finalTime?: Date;
  claimTime?: Date;
  proofOfResult?: string;
  playType?: string;
  tokens?: string[];
}
