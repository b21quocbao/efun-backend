import { EventEntity } from 'src/modules/events/entities/event.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CountryEntity } from '../../countries/entities/country.entity';
import { LeagueEntity } from '../../leagues/entities/league.entity';
import { RoundEntity } from '../../rounds/entities/round.entity';
import { SeasonEntity } from '../../seasons/entities/season.entity';
import { GoalEntity } from './goal.entity';

@Entity('fixtures')
export class FixtureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  bcMatchMeta?: string;

  @Column({ nullable: true, default: false })
  bcResult?: boolean;

  @Column({ nullable: true })
  bcResultMeta?: string;

  @Column({ nullable: true, unique: true })
  remoteId?: number;

  @Column({ nullable: true, default: false })
  hot?: boolean;

  @Column({ nullable: true })
  referee?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ nullable: true })
  date?: Date;

  @Column({ nullable: true })
  timestamp?: number;

  @Column({ nullable: true })
  periodsFirst?: number;

  @Column({ nullable: true })
  periodsSecond?: number;

  @Column({ nullable: true })
  venueRemoteId?: number;

  @Column({ nullable: true })
  venueName?: string;

  @Column({ nullable: true })
  venueCity?: string;

  @Column({ nullable: true })
  statusLong?: string;

  @Column({ nullable: true })
  statusShort?: string;

  @Column({ nullable: true })
  statusElapsed?: number;

  @ManyToOne(() => CountryEntity, (country) => country.fixtures)
  @JoinColumn({ name: 'countryId' })
  country?: CountryEntity;

  @Column({ nullable: true })
  countryId?: number;

  @ManyToOne(() => LeagueEntity, (league) => league.fixtures)
  @JoinColumn({ name: 'leagueId' })
  league?: LeagueEntity;

  @Column({ nullable: true })
  leagueId?: number;

  @ManyToOne(() => SeasonEntity, (season) => season.fixtures)
  @JoinColumn({ name: 'seasonId' })
  season?: SeasonEntity;

  @Column({ nullable: true })
  seasonId?: number;

  @ManyToOne(() => RoundEntity, (round) => round.fixtures)
  @JoinColumn({ name: 'roundId' })
  round?: RoundEntity;

  @Column({ nullable: true })
  roundId?: number;

  @Column({ nullable: true })
  teamHomeId?: number;

  @Column({ nullable: true })
  teamAwayId?: number;

  @Column({ nullable: true })
  teamWinnerId?: number;

  @Column({ nullable: true })
  fixtureMeta?: string;

  @Column({ nullable: true })
  leagueMeta?: string;

  @Column({ nullable: true })
  teamsMeta?: string;

  @Column({ nullable: true })
  goalsMeta?: string;

  @Column({ nullable: true })
  scoreMeta?: string;

  @Column({ nullable: true })
  meta?: string;

  @Column({ nullable: true })
  oddMeta?: string;

  @OneToMany(() => GoalEntity, (goal) => goal.fixture)
  goals: GoalEntity[];

  @OneToMany(() => EventEntity, (event) => event.fixture)
  events: EventEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
