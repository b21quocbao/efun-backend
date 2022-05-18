export class CreatePredictionDto {
  eventId: number;
  userId: number;
  transactionId: string;
  option: string;
  token: string;
  amount: string;
}
