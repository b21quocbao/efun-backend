import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { ElpsService } from './elps.service';
import { SearchElpDto } from './dto/search-elp.dto';
import { ElpEntity } from './entities/elp.entity';

@ApiTags('Elps')
@Controller('elps')
export class ElpsController {
  constructor(private readonly elpsService: ElpsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() searchElpDto: SearchElpDto,
  ): Promise<Response<ElpEntity[]>> {
    return this.elpsService.findAll(searchElpDto, pageNumber, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ElpEntity> {
    return this.elpsService.findOne(+id);
  }
}
