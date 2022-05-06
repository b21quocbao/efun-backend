import { EventEntity } from 'src/modules/events/entities/event.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
} from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  logoUrl: string;

  @Column({ nullable: true, unique: true })
  index?: number;

  @OneToMany(() => EventEntity, (event) => event.category)
  events: EventEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
