import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity('teams')
export class TeamEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  countryId?: number;
  // references: 'countries',
  // onDelete: 'CASCADE',

  @Column({ nullable: true, unique: true })
  remoteId?: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  founded?: number;

  @Column({ nullable: true })
  national?: boolean;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  meta?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
