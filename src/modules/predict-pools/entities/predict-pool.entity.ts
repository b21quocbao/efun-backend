import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
} from 'typeorm';

@Entity('predictPools')
export class PredictPoolEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.predictPool)
  transactions: TransactionEntity[];

  @Column()
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
