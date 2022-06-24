import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { CompetitionEntity } from 'src/modules/competitions/entities/competition.entity';
import { PoolEntity } from 'src/modules/pools/entities/pool.entity';
import { PredictionEntity } from 'src/modules/predictions/entities/prediction.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryColumn,
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
import { MarketType } from '../enums/market-type.enum';

@Entity('events')
export class EventEntity {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.events)
  user: UserEntity;

  @Column()
  name: string;

  @Column({ default: EventStatus.AVAILABLE })
  status: EventStatus;

  @Column()
  thumbnailUrl: string;

  @Column({ nullable: true })
  bannerUrl: string;

  @ManyToOne(() => CategoryEntity, (category) => category.events)
  category: CategoryEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.subEvents)
  @JoinColumn({ name: 'subCategoryId' })
  subCategory: CategoryEntity;

  @ManyToOne(() => CompetitionEntity, (competition) => competition.events)
  competition: CompetitionEntity;

  @OneToMany(() => PoolEntity, (pool) => pool.event)
  pools: PoolEntity[];

  @Column()
  type: EventType;

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

  @Column({ default: MarketType.None })
  marketType: MarketType;

  @Column()
  userId: number;

  @Column()
  categoryId: number;

  @Column({ nullable: true })
  subCategoryId?: number;

  @Column({ nullable: true })
  competitionId?: number;

  @Column({ default: false })
  isHot: boolean;

  @Column({ nullable: true })
  totalScore: number;

  @Column({ nullable: true })
  scoreOne: number;

  @Column({ nullable: true })
  scoreTwo: number;

  @OneToOne(() => TransactionEntity)
  @JoinColumn()
  transaction?: TransactionEntity;

  @Column({ nullable: true })
  transactionId: number;

  @Column({ default: '' })
  metadata: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
