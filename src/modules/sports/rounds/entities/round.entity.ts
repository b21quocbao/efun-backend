import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity('rounds')
export class RoundEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  leagueId?: number;
  // references: 'leagues',
  // onDelete: 'CASCADE',

  @Column({ nullable: true })
  seasonId?: number;
  // references: 'seasons',
  // onDelete: 'CASCADE',

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true, default: false })
  current?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
