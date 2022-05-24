import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { CompetitionsService } from './competitions.service';
import { SearchCompetitionDto } from './dto/search-competition.dto';
import { CompetitionEntity } from './entities/competition.entity';

@ApiTags('Competitions')
@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() searchCompetitionDto: SearchCompetitionDto,
  ): Promise<Response<CompetitionEntity[]>> {
    return this.competitionsService.findAll(
      searchCompetitionDto,
      pageNumber,
      pageSize,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CompetitionEntity> {
    return this.competitionsService.findOne(+id);
  }
}
