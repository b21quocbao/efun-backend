export class CreateTransactionDto {
  amount: string;
  contractAddress: string;
  predictionId: number;
  predictPoolId: number;
  walletAddress: string;
  txId: string;
  gas: number;
}
