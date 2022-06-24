import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { EventEntity } from './entities/event.entity';
import { GetAllEventDto, GetOtherEventDto } from './dto/get-event.dto';
import { UpdateResultProofDto } from './dto/update-result-proof.dto';
import { UpdateStreamUrlDto } from './dto/update-stream-url.dto';
import { UpdateScoresDto } from './dto/update-scores.dto';

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
    const { data } = await this.eventsService.findAll({ eventId: +id });
    return data[0];
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

  @Put('streamUrl/:id')
  async updateStreamUrl(
    @Param('id') id: string,
    @Body() updateStreamUrlDto: UpdateStreamUrlDto,
  ): Promise<void> {
    return this.eventsService.updateStreamUrl(
      +id,
      updateStreamUrlDto.streamUrl,
    );
  }

  @Put('scores/:id')
  async updateScores(
    @Param('id') id: string,
    @Body() updateScoresDto: UpdateScoresDto,
  ): Promise<void> {
    return this.eventsService.updateScores(
      +id,
      updateScoresDto.totalScore,
      updateScoresDto.scoreOne,
      updateScoresDto.scoreTwo,
    );
  }
}
