export class CreatePredictionDto {
  eventId: number;
  userId: number;
  transactionId: number;
  optionIndex: number;
  token: string;
  amount: string;
  predictNum: number;
}
