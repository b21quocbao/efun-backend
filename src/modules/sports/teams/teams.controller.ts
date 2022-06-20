import { Controller, Get, Query } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { TeamEntity } from './entities/team.entity';
import { GetTeamDto } from './dto/get-team.dto';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() getTeamDto: GetTeamDto,
  ): Promise<Response<TeamEntity[]>> {
    return this.teamsService.findAll(getTeamDto, pageNumber, pageSize);
  }
}
