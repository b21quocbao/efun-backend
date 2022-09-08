import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FixtureEntity } from '../../fixtures/entities/fixture.entity';
import { LeagueEntity } from '../../leagues/entities/league.entity';
import { SeasonEntity } from '../../seasons/entities/season.entity';

@Entity('rounds')
export class RoundEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LeagueEntity, (league) => league.rounds)
  @JoinColumn({ name: 'leagueId' })
  league?: LeagueEntity;

  @Column({ nullable: true })
  leagueId?: number;

  @ManyToOne(() => SeasonEntity, (season) => season.rounds)
  @JoinColumn({ name: 'seasonId' })
  season?: SeasonEntity;

  @Column({ nullable: true })
  seasonId?: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true, default: false })
  current?: boolean;

  @OneToMany(() => FixtureEntity, (fixture) => fixture.round)
  fixtures: FixtureEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
