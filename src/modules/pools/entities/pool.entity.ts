import { EventEntity } from 'src/modules/events/entities/event.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Unique,
  OneToOne,
} from 'typeorm';

@Entity('pools')
@Unique(['token', 'eventId'])
export class PoolEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventEntity, (event) => event.pools)
  @JoinColumn()
  event?: EventEntity;

  @ManyToOne(() => TransactionEntity)
  @JoinColumn({ name: 'transactionId' })
  transaction: TransactionEntity;

  @ManyToOne(() => TransactionEntity)
  @JoinColumn({ name: 'claimTransactionId' })
  claimTransaction?: TransactionEntity;

  @Column()
  token: string;

  @Column({ nullable: true })
  eventId?: number;

  @Column({ default: false })
  affiliate: boolean;

  @Column()
  transactionId: number;

  @Column()
  amount: string;

  @Column({ nullable: true })
  claimTransactionId?: number;

  @Column({ nullable: true })
  claimAmount?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
