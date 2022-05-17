import { PredictionEntity } from 'src/modules/predictions/entities/prediction.entity';
import { RewardEntity } from 'src/modules/rewards/entities/reward.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
} from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: string;

  @Column()
  contractAddress: string;

  @OneToOne(() => PredictionEntity, (prediction) => prediction.transaction)
  prediction?: PredictionEntity;

  @OneToOne(() => RewardEntity, (reward) => reward.transaction)
  reward?: RewardEntity;

  @Column({ nullable: true })
  walletAddress: string;

  @Column()
  txId: string;

  @Column({ nullable: true })
  gas: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
