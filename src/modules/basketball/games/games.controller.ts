import { Controller, Get, Param, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { GameEntity } from './entities/game.entity';
import { GetGameDto } from './dto/get-game.dto';
import { GoalEntity } from './entities/goal.entity';
import { GetGoalDto } from './dto/get-goal.dto';

@ApiTags('Basketball Games')
@Controller('basketball/games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() getGameDto: GetGameDto,
  ): Promise<Response<GameEntity[]>> {
    return this.gamesService.findAll(getGameDto, pageNumber, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GameEntity> {
    const { data } = await this.gamesService.findAll({ gameId: +id });
    return data[0];
  }

  @Get('goals')
  async findAllGoals(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() getGoalDto: GetGoalDto,
  ): Promise<Response<GoalEntity[]>> {
    return this.gamesService.findAllGoals(getGoalDto, pageNumber, pageSize);
  }
}
