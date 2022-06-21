import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../../countries/entities/country.entity';
import { FixtureEntity } from '../../fixtures/entities/fixture.entity';
import { RoundEntity } from '../../rounds/entities/round.entity';
import { SeasonEntity } from '../../seasons/entities/season.entity';

@Entity('leagues')
export class LeagueEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CountryEntity, (country) => country.leagues)
  @JoinColumn({ name: 'countryId' })
  country?: CountryEntity;

  @Column({ nullable: true })
  countryId?: number;

  @Column({ nullable: true, unique: true })
  remoteId?: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column({ nullable: true, default: 0 })
  order?: number;

  @Column({ nullable: true })
  meta?: string;

  @ManyToMany(() => SeasonEntity)
  @JoinTable()
  seasons: SeasonEntity[];

  @OneToMany(() => FixtureEntity, (fixture) => fixture.league)
  fixtures: FixtureEntity[];

  @OneToMany(() => RoundEntity, (round) => round.league)
  rounds: RoundEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
