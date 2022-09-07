import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { AnalyticEntity } from './entities/analytic.entity';

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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AnalyticEntity> {
    return this.analyticsService.findOne(+id);
  }
}
