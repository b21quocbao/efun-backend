import { Controller, Get, Param } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PredictionEntity } from './entities/prediction.entity';

@ApiTags('Predictions')
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get()
  async findAll(): Promise<Response<PredictionEntity[]>> {
    return this.predictionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PredictionEntity> {
    return this.predictionsService.findOne(+id);
  }
}
