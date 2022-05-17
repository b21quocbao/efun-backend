export class CreateTransactionDto {
  amount: string;
  contractAddress: string;
  predictionId: number;
  walletAddress: string;
  txId: string;
  gas: number;
}
