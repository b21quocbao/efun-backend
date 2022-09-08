import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountryEntity } from '../../countries/entities/country.entity';

@Entity('teams')
export class TeamEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CountryEntity, (country) => country.teams)
  @JoinColumn({ name: 'countryId' })
  country?: CountryEntity;

  @Column({ nullable: true })
  countryId?: number;

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
