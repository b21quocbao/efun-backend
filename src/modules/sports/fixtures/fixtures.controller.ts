import { Controller, Get, Query } from '@nestjs/common';
import { FixturesService } from './fixtures.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { FixtureEntity } from './entities/fixture.entity';
import { GetFixtureDto } from './dto/get-fixture.dto';
import { GoalEntity } from './entities/goal.entity';
import { GetGoalDto } from './dto/get-goal.dto';

@ApiTags('Fixtures')
@Controller('fixtures')
export class FixturesController {
  constructor(private readonly fixturesService: FixturesService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() getFixtureDto: GetFixtureDto,
  ): Promise<Response<FixtureEntity[]>> {
    return this.fixturesService.findAll(getFixtureDto, pageNumber, pageSize);
  }

  @Get('goals')
  async findAllGoals(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() getGoalDto: GetGoalDto,
  ): Promise<Response<GoalEntity[]>> {
    return this.fixturesService.findAllGoals(getGoalDto, pageNumber, pageSize);
  }
}
