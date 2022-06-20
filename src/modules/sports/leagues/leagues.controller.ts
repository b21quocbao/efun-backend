import { Controller, Get, Query } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { LeagueEntity } from './entities/league.entity';

@ApiTags('Leagues')
@Controller('leagues')
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
  ): Promise<Response<LeagueEntity[]>> {
    return this.leaguesService.findAll(pageNumber, pageSize);
  }
}
