import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { AnalyticEntity } from './entities/analytic.entity';
import { CountNewWalletDto } from './dto/count-new-wallet.dto';
import { CountNewEventDto } from './dto/count-new-event.dto';
import { CountNewPredictionDto } from './dto/count-new-prediction.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
  ): Promise<Response<AnalyticEntity[]>> {
    return this.analyticsService.findAll(pageNumber, pageSize);
  }

  @Get('date/:date')
  async findOneByDate(@Param('date') date: string): Promise<AnalyticEntity> {
    return this.analyticsService.findOneByDate(date);
  }

  @Get('count-new-wallet')
  async countNewWallet(@Query() request: CountNewWalletDto): Promise<number> {
    return this.analyticsService.countNewWallet(request);
  }

  @Get('count-new-event')
  async countNewEvent(@Query() request: CountNewEventDto): Promise<any[]> {
    return this.analyticsService.countNewEvent(request);
  }

  @Get('count-new-prediction')
  async countNewPrediction(
    @Query() request: CountNewPredictionDto,
  ): Promise<any[]> {
    return this.analyticsService.countNewPrediction(request);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AnalyticEntity> {
    return this.analyticsService.findOne(+id);
  }
}
