import { Controller, Get, Param, Query } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { PoolEntity } from './entities/pool.entity';

@ApiTags('Pools')
@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
  ): Promise<Response<PoolEntity[]>> {
    return this.poolsService.findAll(pageNumber, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PoolEntity> {
    return this.poolsService.findOne(+id);
  }
}
