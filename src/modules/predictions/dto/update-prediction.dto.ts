import { PartialType } from '@nestjs/swagger';
import { CreatePredictionDto } from './create-prediction.dto';

export class UpdatePredictionDto extends PartialType(CreatePredictionDto) {
  rewardAmount?: string;
  rewardTransactionId?: number;
  cashBackTransactionId?: number;
}
