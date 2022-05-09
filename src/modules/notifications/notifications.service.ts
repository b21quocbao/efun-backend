import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  async create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  async findAll() {
    return `This action returns all notifications`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  async remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
