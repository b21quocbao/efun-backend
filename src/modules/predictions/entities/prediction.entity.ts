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
  Unique,
} from 'typeorm';

@Entity('predictions')
@Unique(['userId', 'predictNum'])
export class PredictionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventEntity, (event) => event.predictions)
  event: EventEntity;

  @ManyToOne(() => UserEntity, (user) => user.predictions)
  user: UserEntity;

  @OneToOne(() => TransactionEntity)
  @JoinColumn()
  transaction: TransactionEntity;

  @Column()
  optionIndex: number;

  @Column()
  token: string;

  @Column()
  amount: string;

  @Column()
  eventId: number;

  @Column()
  predictNum: number;

  @Column()
  userId: number;

  @Column()
  transactionId: number;

  @Column({ nullable: true })
  rewardAmount?: string;

  @OneToOne(() => TransactionEntity)
  @JoinColumn({ name: 'rewardTransactionId' })
  rewardTransaction?: TransactionEntity;

  @Column({ nullable: true })
  rewardTransactionId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
