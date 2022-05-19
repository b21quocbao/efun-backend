import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { PoolEntity } from 'src/modules/pools/entities/pool.entity';
import { PredictionEntity } from 'src/modules/predictions/entities/prediction.entity';
import { RewardEntity } from 'src/modules/rewards/entities/reward.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { EventStatus } from '../enums/event-status.enum';
import { EventType } from '../enums/event-type.enum';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.events)
  user: UserEntity;

  @Column()
  name: string;

  @Column({ default: EventStatus.PENDING })
  status: EventStatus;

  @Column()
  thumbnailUrl: string;

  @ManyToOne(() => CategoryEntity, (category) => category.events)
  category: CategoryEntity;

  @OneToMany(() => PoolEntity, (pool) => pool.event)
  pools: PoolEntity[];

  @Column()
  type: EventType;

  @Column({ nullable: true })
  scoreData?: string;

  @Column()
  startTime: Date;

  @Column()
  deadline: Date;

  @Column()
  endTime: Date;

  @Column()
  options: string;

  @Column()
  odds: string;

  @Column({ nullable: true })
  streamUrl?: string;

  @OneToMany(() => PredictionEntity, (prediction) => prediction.event)
  predictions: PredictionEntity[];

  @OneToMany(() => RewardEntity, (reward) => reward.event)
  rewards: RewardEntity[];

  @Column({ default: 0 })
  views: number;

  @Column({ nullable: true })
  result?: string;

  @Column({ nullable: true })
  resultProofUrl?: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  shortDescription: string;

  @Column()
  userId: number;

  @Column()
  categoryId: number;

  @Column({ default: false })
  isHot: boolean;

  @OneToOne(() => TransactionEntity)
  @JoinColumn()
  transaction?: TransactionEntity;

  @Column({ nullable: true })
  transactionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
