import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PoolsService } from './pools.service';
import { CreatePoolDto } from './dto/create-pool.dto';
import { UpdatePoolDto } from './dto/update-pool.dto';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PoolEntity } from './entities/pool.entity';

@ApiTags('Pools')
@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Post()
  async create(@Body() createPoolDto: CreatePoolDto): Promise<PoolEntity> {
    return this.poolsService.create(createPoolDto);
  }

  @Get()
  async findAll(): Promise<Response<PoolEntity[]>> {
    return this.poolsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PoolEntity> {
    return this.poolsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePoolDto: UpdatePoolDto,
  ): Promise<PoolEntity> {
    return this.poolsService.update(+id, updatePoolDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.poolsService.remove(+id);
  }
}
