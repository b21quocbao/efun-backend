import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('nfts')
export class NftEntity {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.events)
  user: UserEntity;

  @Column()
  userId: number;

  @Column({ nullable: true })
  classId: string;

  @Column()
  buyNav: string;

  @Column()
  buyAmount: string;

  @Column()
  buyTimestamp: string;

  @Column({ nullable: true })
  buyFee: string;

  @ManyToOne(() => TransactionEntity)
  @JoinColumn({ name: 'buyTransactionId' })
  buyTransaction?: TransactionEntity;

  @Column({ nullable: true })
  buyTransactionId?: number;

  @Column({ nullable: true })
  cashBackNav?: string;

  @Column({ nullable: true })
  cashBackAmount?: string;

  @Column({ nullable: true })
  cashBackTimestamp?: string;

  @Column({ nullable: true })
  cashBackFee?: string;

  @ManyToOne(() => TransactionEntity)
  @JoinColumn({ name: 'cashBackTransactionId' })
  cashBackTransaction?: TransactionEntity;

  @Column({ nullable: true })
  cashBackTransactionId?: number;

  @Column({ nullable: true })
  actions?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
