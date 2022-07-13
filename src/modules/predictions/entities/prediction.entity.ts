import { EventEntity } from 'src/modules/events/entities/event.entity';
import { ReportEntity } from 'src/modules/reports/entities/report.entity';
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
  OneToMany,
} from 'typeorm';

@Entity('predictions')
@Unique(['userId', 'predictNum', 'token', 'eventId'])
export class PredictionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventEntity, (event) => event.predictions)
  event: EventEntity;

  @ManyToOne(() => UserEntity, (user) => user.predictions)
  user: UserEntity;

  @OneToOne(() => ReportEntity, (report) => report.prediction)
  report: ReportEntity[];

  @OneToOne(() => TransactionEntity)
  @JoinColumn()
  transaction: TransactionEntity;

  @Column()
  optionIndex: number;

  @Column()
  token: string;

  @Column()
  amount: string;

  @Column({ nullable: true })
  status?: string;

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

  @OneToOne(() => TransactionEntity)
  @JoinColumn({ name: 'cashBackTransactionId' })
  cashBackTransaction?: TransactionEntity;

  @Column({ nullable: true })
  rewardTransactionId?: number;

  @Column({ nullable: true })
  cashBackTransactionId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
