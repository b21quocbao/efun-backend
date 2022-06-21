import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { FixtureEntity } from '../../fixtures/entities/fixture.entity';
import { LeagueEntity } from '../../leagues/entities/league.entity';
import { TeamEntity } from '../../teams/entities/team.entity';

@Entity('countries')
export class CountryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  flag?: string;

  @OneToMany(() => FixtureEntity, (fixture) => fixture.country)
  fixtures: FixtureEntity[];

  @OneToMany(() => LeagueEntity, (league) => league.country)
  leagues: LeagueEntity[];

  @OneToMany(() => TeamEntity, (team) => team.country)
  teams: TeamEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
