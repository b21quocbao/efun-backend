import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PredictPoolsService } from './predict-pools.service';
import { CreatePredictPoolDto } from './dto/create-predict-pool.dto';
import { UpdatePredictPoolDto } from './dto/update-predict-pool.dto';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PredictPoolEntity } from './entities/predict-pool.entity';

@ApiTags('Predict Pools')
@Controller('predict-pools')
export class PredictPoolsController {
  constructor(private readonly predictPoolsService: PredictPoolsService) {}

  @Post()
  async create(
    @Body() createPredictPoolDto: CreatePredictPoolDto,
  ): Promise<PredictPoolEntity> {
    return this.predictPoolsService.create(createPredictPoolDto);
  }

  @Get()
  async findAll(): Promise<Response<PredictPoolEntity[]>> {
    return this.predictPoolsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PredictPoolEntity> {
    return this.predictPoolsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePredictPoolDto: UpdatePredictPoolDto,
  ) {
    return this.predictPoolsService.update(+id, updatePredictPoolDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.predictPoolsService.remove(+id);
  }
}
