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

@Entity('rewards')
export class RewardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventEntity, (event) => event.rewards)
  event: EventEntity;

  @ManyToOne(() => UserEntity, (user) => user.rewards)
  user: UserEntity;

  @OneToOne(() => TransactionEntity, (transaction) => transaction.reward)
  @JoinColumn()
  transaction: TransactionEntity;

  @Column()
  token: string;

  @Column()
  amount: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
