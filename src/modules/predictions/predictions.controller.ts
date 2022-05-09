import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PredictionEntity } from './entities/prediction.entity';

@ApiTags('Predictions')
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  async create(
    @Body() createPredictionDto: CreatePredictionDto,
  ): Promise<PredictionEntity> {
    return this.predictionsService.create(createPredictionDto);
  }

  @Get()
  async findAll(): Promise<Response<PredictionEntity[]>> {
    return this.predictionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PredictionEntity> {
    return this.predictionsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePredictionDto: UpdatePredictionDto,
  ) {
    return this.predictionsService.update(+id, updatePredictionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.predictionsService.remove(+id);
  }
}
