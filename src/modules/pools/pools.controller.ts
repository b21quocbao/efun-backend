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

@ApiTags('Pools')
@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Post()
  async create(@Body() createPoolDto: CreatePoolDto) {
    return this.poolsService.create(createPoolDto);
  }

  @Get()
  async findAll() {
    return this.poolsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.poolsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePoolDto: UpdatePoolDto) {
    return this.poolsService.update(+id, updatePoolDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.poolsService.remove(+id);
  }
}
