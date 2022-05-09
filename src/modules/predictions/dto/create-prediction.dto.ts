import { PredictionStatus } from '../enums/prediction-status.enum';

export class CreatePredictionDto {
  eventId: number;
  userId: number;
  data: string;
  status: PredictionStatus;
}
