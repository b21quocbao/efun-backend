import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

export enum TYPE {
  goals,
  score,
}

export enum SUB_TYPE {
  halftime,
  fulltime,
  extratime,
  penalty,
}

@Entity('goals')
export class GoalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  fixtureId?: number;
  // references: 'fixtures'
  // onDelete: 'CASCADE',

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
