export class CreatePoolDto {
  token: string;
  amount: string;
  eventId?: number;
  affiliate?: boolean;
  transactionId: number;
}
