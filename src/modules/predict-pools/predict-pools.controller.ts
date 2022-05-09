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

@ApiTags('Predict Pools')
@Controller('predict-pools')
export class PredictPoolsController {
  constructor(private readonly predictPoolsService: PredictPoolsService) {}

  @Post()
  async create(@Body() createPredictPoolDto: CreatePredictPoolDto) {
    return this.predictPoolsService.create(createPredictPoolDto);
  }

  @Get()
  async findAll() {
    return this.predictPoolsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
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
  async remove(@Param('id') id: string) {
    return this.predictPoolsService.remove(+id);
  }
}
