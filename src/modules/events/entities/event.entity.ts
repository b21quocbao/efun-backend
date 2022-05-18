import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { PredictionEntity } from 'src/modules/predictions/entities/prediction.entity';
import { RewardEntity } from 'src/modules/rewards/entities/reward.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EventStatus } from '../enums/event-status.enum';
import { EventType } from '../enums/event-type.enum';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.events)
  user: UserEntity;

  @Column()
  name: string;

  @Column({ default: EventStatus.PENDING })
  status: EventStatus;

  @Column()
  thumbnailUrl: string;

  @ManyToOne(() => CategoryEntity, (category) => category.events)
  category: CategoryEntity;

  @Column()
  type: EventType;

  @Column({ nullable: true })
  scoreData?: string;

  @Column()
  startTime: Date;

  @Column()
  deadline: Date;

  @Column()
  endTime: Date;

  @Column()
  optionDetails: string;

  @Column({ nullable: true })
  streamUrl?: string;

  @OneToMany(() => PredictionEntity, (prediction) => prediction.event)
  predictions: PredictionEntity[];

  @OneToMany(() => RewardEntity, (reward) => reward.event)
  rewards: RewardEntity[];

  @Column({ default: 0 })
  views: number;

  @Column({ nullable: true })
  result?: string;

  @Column({ nullable: true })
  resultProofUrl?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  shortDescription?: string;

  @Column()
  userId: number;

  @Column({ default: false })
  isHot: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
