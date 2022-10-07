import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { CompetitionEntity } from 'src/modules/competitions/entities/competition.entity';
import { PoolEntity } from 'src/modules/pools/entities/pool.entity';
import { PredictionEntity } from 'src/modules/predictions/entities/prediction.entity';
import { FixtureEntity } from 'src/modules/football/fixtures/entities/fixture.entity';
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
import { CoinEntity } from 'src/modules/coins/entities/coin.entity';

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
  category?: CategoryEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.subEvents)
  @JoinColumn({ name: 'subCategoryId' })
  subCategory: CategoryEntity;

  @ManyToOne(() => CompetitionEntity, (competition) => competition.events)
  competition: CompetitionEntity;

  @ManyToOne(() => FixtureEntity, (fixture) => fixture.events)
  fixture: FixtureEntity;

  @ManyToOne(() => CoinEntity, (coin) => coin.events)
  coin: CoinEntity;

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

  @Column({ nullable: true })
  tokenOptions?: string;

  @Column()
  odds: string;

  @Column({ nullable: true })
  finalResult: string;

  @Column({ nullable: true })
  streamUrl?: string;

  @OneToMany(() => PredictionEntity, (prediction) => prediction.event)
  predictions: PredictionEntity[];

  @Column({ default: 0 })
  views: number;

  @Column({ nullable: true })
  result?: string;

  @Column({ nullable: true })
  resultIndex?: number;

  @Column({ nullable: true })
  resultProofUrl?: string;

  @Column({ nullable: true })
  typeUpload?: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  shortDescription: string;

  @Column({ default: MarketType.None })
  marketType: MarketType;

  @Column({ default: '' })
  playType: string;

  @Column()
  userId: number;

  @Column({ default: 0 })
  pro: number;

  @Column({ nullable: true })
  fixtureId: number;

  @Column({ nullable: true })
  coinId: number;

  @Column({ nullable: true })
  categoryId: number;

  @Column({ nullable: true })
  subCategoryId?: number;

  @Column({ nullable: true })
  competitionId?: number;

  @Column({ nullable: true })
  leagueId?: number;

  @Column({ default: false })
  isHot: boolean;

  @Column({ nullable: true })
  totalScore: number;

  @Column({ nullable: true })
  scoreOne: number;

  @Column({ nullable: true })
  scoreTwo: number;

  @Column({ default: false })
  affiliate: boolean;

  @Column({ default: 0 })
  hostFee: number;

  @Column({ default: '10000000000000000000000' })
  creationFee: string;

  @Column('text', { default: [], array: true })
  tokens: string[];

  @OneToOne(() => TransactionEntity)
  @JoinColumn()
  transaction?: TransactionEntity;

  @Column({ nullable: true })
  transactionId?: number;

  @Column({
    type: 'jsonb',
    default: {},
  })
  poolTokenAmounts: Record<string, string>;

  @Column({
    type: 'jsonb',
    default: {},
  })
  poolTokenEstimateClaimAmounts: Record<string, string>;

  @Column({
    type: 'jsonb',
    default: {},
  })
  poolTokenClaimAmounts: Record<string, string>;

  @Column({
    type: 'jsonb',
    default: {},
  })
  predictionTokenAmounts: Record<string, string>;

  @Column({
    type: 'jsonb',
    default: {},
  })
  predictionTokenOptionAmounts: Record<string, string>;

  @ManyToOne(() => TransactionEntity)
  @JoinColumn({ name: 'updateResultTransactionId' })
  updateResultTransaction?: TransactionEntity;

  @Column({ nullable: true })
  updateResultTransactionId?: number;

  @Column({ default: '' })
  metadata: string;

  @Column({ default: false })
  isBlock: boolean;

  @Column({ nullable: true })
  finalTime: Date;

  @Column({ nullable: true })
  claimTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
