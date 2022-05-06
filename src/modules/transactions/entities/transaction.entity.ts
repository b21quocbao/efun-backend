import { PredictPoolEntity } from 'src/modules/predict-pools/entities/predict-pool.entity';
import { PredictionEntity } from 'src/modules/predictions/entities/prediction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: string;

  @Column()
  contractAddress: string;

  @ManyToOne(() => PredictionEntity, (prediction) => prediction.transactions)
  prediction: PredictionEntity;

  @ManyToOne(() => PredictPoolEntity, (predictPool) => predictPool.transactions)
  predictPool: PredictPoolEntity;

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
