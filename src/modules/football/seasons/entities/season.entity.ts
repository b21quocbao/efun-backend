import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { FixtureEntity } from '../../fixtures/entities/fixture.entity';
import { RoundEntity } from '../../rounds/entities/round.entity';

@Entity('seasons')
export class SeasonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  year?: number;

  @OneToMany(() => FixtureEntity, (fixture) => fixture.season)
  fixtures: FixtureEntity[];

  @OneToMany(() => RoundEntity, (round) => round.season)
  rounds: RoundEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
