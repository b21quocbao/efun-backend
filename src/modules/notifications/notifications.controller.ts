import { Controller, Get, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { NotificationEntity } from './entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
  ): Promise<Response<NotificationEntity[]>> {
    return this.notificationsService.findAll(pageNumber, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<NotificationEntity> {
    return this.notificationsService.findOne(+id);
  }
}
