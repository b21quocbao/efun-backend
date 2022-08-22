import { CompetitionEntity } from 'src/modules/competitions/entities/competition.entity';
import { EventEntity } from 'src/modules/events/entities/event.entity';
import { NotificationEntity } from 'src/modules/notifications/entities/notification.entity';
import { PredictionEntity } from 'src/modules/predictions/entities/prediction.entity';
import { ReportEntity } from 'src/modules/reports/entities/report.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  address: string;

  @Column({ default: '' })
  description: string;

  @OneToMany(() => EventEntity, (event) => event.user)
  events: EventEntity[];

  @OneToMany(() => ReportEntity, (report) => report.user)
  reports: ReportEntity[];

  @OneToMany(() => PredictionEntity, (prediction) => prediction.user)
  predictions: PredictionEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];

  @OneToMany(() => CompetitionEntity, (competition) => competition.user)
  competitions: CompetitionEntity[];

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  ip?: string;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  followers: UserEntity[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  bannerUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
