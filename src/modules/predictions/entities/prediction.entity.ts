import { EventEntity } from 'src/modules/events/entities/event.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { PredictionStatus } from '../enums/prediction-status.enum';

@Entity('predictions')
export class PredictionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventEntity, (event) => event.predictions)
  event: EventEntity;

  @ManyToOne(() => UserEntity, (user) => user.predictions)
  user: UserEntity;

  @OneToOne(() => TransactionEntity, (transaction) => transaction.prediction)
  @JoinColumn()
  transaction: TransactionEntity;

  @Column()
  option: string;

  @Column()
  token: string;

  @Column()
  amount: string;

  @Column({ default: PredictionStatus.Pending })
  status: PredictionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
