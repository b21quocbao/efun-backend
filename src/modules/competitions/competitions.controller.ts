import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
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

  @Post()
  async create(
    @UserID() userId: number,
    @Body() createCompetitionDto: CreateCompetitionDto,
  ): Promise<CompetitionEntity> {
    return this.competitionsService.create(userId, createCompetitionDto);
  }
}
