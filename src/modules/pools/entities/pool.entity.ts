import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
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
@Unique(['token', 'userId'])
export class PoolEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.pools)
  @JoinColumn()
  user: UserEntity;

  @OneToOne(() => TransactionEntity)
  @JoinColumn()
  transaction: TransactionEntity;

  @Column()
  token: string;

  @Column()
  userId: number;

  @Column()
  transactionId: number;

  @Column()
  amount: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
