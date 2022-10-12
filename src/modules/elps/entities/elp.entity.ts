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

@Entity('elps')
export class ElpEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => TransactionEntity)
  @JoinColumn()
  transaction?: TransactionEntity;

  @Column({ nullable: true })
  transactionId?: number;

  @ManyToOne(() => UserEntity, (user) => user.events)
  user: UserEntity;

  @Column()
  userId: number;

  @Column()
  nav: string;

  @Column()
  amount: string;

  @Column()
  timestamp: string;

  @Column({ nullable: true })
  fee: string;

  @Column()
  buy: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
