import { Controller, Get, Param } from '@nestjs/common';
import { PredictPoolsService } from './predict-pools.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PredictPoolEntity } from './entities/predict-pool.entity';

@ApiTags('Predict Pools')
@Controller('predict-pools')
export class PredictPoolsController {
  constructor(private readonly predictPoolsService: PredictPoolsService) {}

  @Get()
  async findAll(): Promise<Response<PredictPoolEntity[]>> {
    return this.predictPoolsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PredictPoolEntity> {
    return this.predictPoolsService.findOne(+id);
  }
}
