import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { PoolEntity } from 'src/modules/pools/entities/pool.entity';
import { PredictPoolEntity } from 'src/modules/predict-pools/entities/predict-pool.entity';
import { PredictionEntity } from 'src/modules/predictions/entities/prediction.entity';
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
import { EventType } from '../enums/event-type.enum';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.events)
  user: UserEntity;

  @Column()
  name: string;

  @Column()
  thumbnailUrl: string;

  @ManyToOne(() => CategoryEntity, (category) => category.events)
  category: CategoryEntity;

  @Column()
  type: EventType;

  @Column({ nullable: true })
  scoreData?: string;

  @OneToMany(() => PoolEntity, (pool) => pool.event)
  pools: PoolEntity[];

  @OneToMany(() => PredictPoolEntity, (predictPool) => predictPool.event)
  predictPools: PredictPoolEntity[];

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
