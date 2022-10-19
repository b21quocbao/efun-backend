import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { NavsService } from './navs.service';
import { SearchNavDto } from './dto/search-nav.dto';
import { NavEntity } from './entities/nav.entity';

@ApiTags('Navs')
@Controller('navs')
export class NavsController {
  constructor(private readonly navsService: NavsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() searchNavDto: SearchNavDto,
  ): Promise<Response<NavEntity[]>> {
    return this.navsService.findAll(searchNavDto, pageNumber, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<NavEntity> {
    return this.navsService.findOne(+id);
  }
}
