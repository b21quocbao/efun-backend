import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { EventEntity } from 'src/modules/events/entities/event.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity('competitions')
export class CompetitionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => CategoryEntity, (category) => category.competitions)
  category: CategoryEntity;

  @ManyToOne(() => UserEntity, (user) => user.competitions)
  user: UserEntity;

  @Column()
  categoryId: number;

  @OneToMany(() => EventEntity, (event) => event.competition)
  events: EventEntity[];

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
