import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contractAddress: string;

  @Column({ nullable: true })
  walletAddress: string;

  @Column()
  txId: string;

  @Column({ nullable: true })
  gas: number;

  @Column({ nullable: true })
  blockNumber: number;

  @Column({ nullable: true })
  receipt: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
