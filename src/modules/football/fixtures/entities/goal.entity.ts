import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FixtureEntity } from './fixture.entity';

export enum TYPE {
  goals = 'goals',
  score = 'score',
}

export enum SUB_TYPE {
  halftime = 'halftime',
  fulltime = 'fulltime',
  extratime = 'extratime',
  penalty = 'penalty',
}

@Entity('goals')
export class GoalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FixtureEntity, (fixture) => fixture.goals)
  @JoinColumn({ name: 'fixtureId' })
  fixture?: FixtureEntity;

  @Column({ nullable: true })
  fixtureId?: number;

  @Column({ nullable: true })
  type?: TYPE;

  @Column({ nullable: true })
  subType?: SUB_TYPE;

  @Column({ nullable: true })
  home?: number;

  @Column({ nullable: true })
  away?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
