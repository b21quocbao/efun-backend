import { PredictionEntity } from 'src/modules/predictions/entities/prediction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('reports')
export class ReportEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ nullable: true })
  status: string;

  @Column({ default: '' })
  typeUpload: string;

  @ManyToOne(() => UserEntity, (user) => user.reports)
  user: UserEntity;

  @OneToOne(() => PredictionEntity, (prediction) => prediction.report)
  @JoinColumn()
  prediction: PredictionEntity;

  @Column()
  userId: number;

  @Column()
  predictionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
