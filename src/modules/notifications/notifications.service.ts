import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    return this.notificationRepository.save(createNotificationDto);
  }

  async findAll(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<NotificationEntity[]>> {
    const qb = this.notificationRepository.createQueryBuilder('notifications');

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<NotificationEntity> {
    return this.notificationRepository.findOne(id);
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationEntity> {
    await this.notificationRepository.update(id, updateNotificationDto);
    return this.notificationRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }
}
