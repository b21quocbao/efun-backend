export class CreateTransactionDto {
  amount: string;
  contractAddress: string;
  walletAddress: string;
  txId: string;
  gas: number;
}
