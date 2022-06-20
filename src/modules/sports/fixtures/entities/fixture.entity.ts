import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity('fixtures')
export class FixtureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  bcMatchId?: number;

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

  @Column({ nullable: true })
  countryId?: number;
  // references: 'countries',
  // onDelete: 'CASCADE',

  @Column({ nullable: true })
  leagueId?: number;
  // references: 'leagues',
  // onDelete: 'CASCADE',

  @Column({ nullable: true })
  seasonId?: number;
  // references: 'seasons',
  // onDelete: 'CASCADE',

  @Column({ nullable: true })
  roundId?: number;
  // references: 'rounds',
  // onDelete: 'CASCADE',

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
  homeHandicap?: number;

  @Column({ nullable: true })
  awayHandicap?: number;

  @Column({ nullable: true })
  homeOdd?: number;

  @Column({ nullable: true })
  awayOdd?: number;

  @Column({ nullable: true })
  asianHandicapMeta?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
