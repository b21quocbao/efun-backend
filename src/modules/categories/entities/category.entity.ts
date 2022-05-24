import { EventEntity } from 'src/modules/events/entities/event.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
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

  @ManyToOne(() => CategoryEntity, (category) => category.children)
  @JoinColumn({ name: 'fatherId' })
  father?: CategoryEntity;

  @Column({ nullable: true })
  fatherId?: number;

  @OneToMany(() => CategoryEntity, (category) => category.father)
  children: CategoryEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
