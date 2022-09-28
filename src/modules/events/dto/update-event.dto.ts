import { PartialType } from '@nestjs/swagger';
import { EventStatus } from '../enums/event-status.enum';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  status?: EventStatus;
  userId?: number;
  resultIndex?: number;
  result?: string;
  isBlock?: boolean;
  finalTime?: Date;
  claimTime?: Date;
  proofOfResult?: string;
  updateResultTransactionId?: number;
  playType?: string;
  tokens?: string[];
  poolTokenAmounts?: Record<string, string>;
  poolTokenEstimateClaimAmounts?: Record<string, string>;
  poolTokenClaimAmounts?: Record<string, string>;
  predictionTokenAmounts?: Record<string, string>;
  predictionTokenOptionAmounts?: Record<string, string>;
}
