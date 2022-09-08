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
import { SeasonEntity } from '../../seasons/entities/season.entity';
import { TeamEntity } from '../../teams/entities/team.entity';
import { GoalEntity } from './goal.entity';

@Entity('basketball_games')
export class GameEntity {
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

  @ManyToOne(() => CountryEntity, (country) => country.games)
  @JoinColumn({ name: 'countryId' })
  country?: CountryEntity;

  @Column({ nullable: true })
  countryId?: number;

  @ManyToOne(() => LeagueEntity, (league) => league.games)
  @JoinColumn({ name: 'leagueId' })
  league?: LeagueEntity;

  @Column({ nullable: true })
  leagueId?: number;

  @ManyToOne(() => SeasonEntity, (season) => season.games)
  @JoinColumn({ name: 'seasonId' })
  season?: SeasonEntity;

  @Column({ nullable: true })
  seasonId?: number;

  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'teamHomeId' })
  teamHome?: TeamEntity;

  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'teamAwayId' })
  teamAway?: TeamEntity;

  @Column({ nullable: true })
  teamHomeId?: number;

  @Column({ nullable: true })
  teamAwayId?: number;

  @Column({ nullable: true })
  teamWinnerId?: number;

  @Column({ nullable: true })
  gameMeta?: string;

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

  @Column({ default: 'Football' })
  sport?: string;

  @Column({ nullable: true })
  oddMeta?: string;

  @Column({ default: new Date() })
  lastUpdateOdd: Date;

  @OneToMany(() => GoalEntity, (goal) => goal.game)
  goals: GoalEntity[];

  // @OneToMany(() => EventEntity, (event) => event.game)
  // events: EventEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
