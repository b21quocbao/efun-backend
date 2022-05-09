import { NotificationStatus } from '../enums/notification-status.enum';

export class CreateNotificationDto {
  content: string;
  status: NotificationStatus;
  userId: number;
  metadata?: string;
}
