import { Controller, Get, Param, Query } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { PredictionEntity } from './entities/prediction.entity';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { SearchPredictionDto } from './dto/search-prediction.dto';

@ApiTags('Predictions')
@Controller('predictions')
@ApiBearerAuth()
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get()
  async findAll(
    @UserID() userId: number,
    @Query() request: SearchPredictionDto,
    @Query() { pageNumber, pageSize }: PaginationInput,
  ): Promise<Response<PredictionEntity[]>> {
    return this.predictionsService.findAll(
      { ...request, userId },
      pageNumber,
      pageSize,
    );
  }

  @Get(':id')
  async findOne(
    @UserID() userId: number,
    @Param('id') id: string,
  ): Promise<PredictionEntity> {
    return this.predictionsService.findOne(userId, +id);
  }
}
