import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity('bets')
export class BetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  remoteId?: number;

  @Column({ nullable: true })
  name?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
