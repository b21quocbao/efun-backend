import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GameEntity } from './game.entity';

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

@Entity('basketball_goals')
export class GoalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => GameEntity, (game) => game.goals)
  @JoinColumn({ name: 'gameId' })
  game?: GameEntity;

  @Column({ nullable: true })
  gameId?: number;

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
