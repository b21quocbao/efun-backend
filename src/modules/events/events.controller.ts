import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { EventEntity } from './entities/event.entity';
import { GetAllEventDto, GetOtherEventDto } from './dto/get-event.dto';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateResultProofDto } from './dto/update-result-proof.dto';

@ApiTags('Events')
@Controller('events')
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(
    @Query() request: GetAllEventDto,
  ): Promise<Response<EventEntity[]>> {
    return this.eventsService.findAll(request);
  }

  @Get('others')
  async findOtherEvent(@Query() request: GetOtherEventDto) {
    return this.eventsService.findOtherEvents(request);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EventEntity> {
    return this.eventsService.findOne(+id);
  }

  @Put('view/:id')
  async incView(@Param('id') id: string): Promise<void> {
    return this.eventsService.incView(+id);
  }

  @Put('update-result-proof/:id')
  async updateResultProof(
    @Param('id') id: string,
    @Body() updateResultProofDto: UpdateResultProofDto,
  ): Promise<void> {
    return this.eventsService.updateResultProof(
      +id,
      updateResultProofDto.resultProofUrl,
    );
  }

  @Post()
  async create(
    @UserID() userId: number,
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventEntity> {
    return this.eventsService.create(userId, createEventDto);
  }
}
