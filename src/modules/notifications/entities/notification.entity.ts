import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { NotificationStatus } from '../enums/notification-status.enum';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ default: NotificationStatus.notSeen })
  status: NotificationStatus;

  @ManyToOne(() => UserEntity, (user) => user.notifications)
  user: UserEntity;

  @Column()
  userId: number;

  @Column({ nullable: true })
  metadata?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
