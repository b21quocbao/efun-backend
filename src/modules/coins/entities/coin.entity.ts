import { EventEntity } from 'src/modules/events/entities/event.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('coins')
export class CoinEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Index()
  @Column({ unique: true })
  symbol: string;

  @Column()
  rate: string;

  @Column({ nullable: true })
  volume: string;

  @Column({ nullable: true })
  logo: string;

  @OneToMany(() => EventEntity, (event) => event.fixture)
  events: EventEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
