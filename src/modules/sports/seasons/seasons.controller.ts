import { Controller, Get, Query } from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { SeasonEntity } from './entities/season.entity';
import { GetSeasonDto } from './dto/get-season.dto';

@ApiTags('Seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() getSeasonDto: GetSeasonDto,
  ): Promise<Response<SeasonEntity[]>> {
    return this.seasonsService.findAll(getSeasonDto, pageNumber, pageSize);
  }
}
