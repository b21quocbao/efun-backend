import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { SeasonEntity } from '../../seasons/entities/season.entity';

@Entity('leagues')
export class LeagueEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  countryId?: number;
  // references: 'countries',
  // onDelete: 'CASCADE'

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
