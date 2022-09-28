import { PartialType } from '@nestjs/swagger';
import { CreatePredictionDto } from './create-prediction.dto';

export class UpdatePredictionDto extends PartialType(CreatePredictionDto) {
  status?: string;
  estimateReward?: string;
  sponsor?: string;
  rewardAmount?: string;
  rewardTransactionId?: number;
  cashBackTransactionId?: number;
}
