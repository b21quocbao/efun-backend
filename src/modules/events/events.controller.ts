import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { EventEntity } from './entities/event.entity';
import { GetAllEventDto } from './dto/get-event.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(
    @Query() request: GetAllEventDto,
  ): Promise<Response<EventEntity[]>> {
    return this.eventsService.findAll(request);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EventEntity> {
    return this.eventsService.findOne(+id);
  }
}
