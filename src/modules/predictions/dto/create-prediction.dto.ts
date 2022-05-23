export class CreatePredictionDto {
  eventId: number;
  userId: number;
  transactionId: number;
  option: string;
  token: string;
  amount: string;
  predictNum: number;
}
