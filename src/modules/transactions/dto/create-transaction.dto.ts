export class CreateTransactionDto {
  contractAddress: string;
  walletAddress: string;
  txId: string;
  gas: number;
  receipt: string;
  blockNumber: number;
}
