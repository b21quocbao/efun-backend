import { Controller, Get, Query } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { RoundEntity } from './entities/round.entity';
import { GetRoundDto } from './dto/get-round.dto';

@ApiTags('Rounds')
@Controller('rounds')
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() getRoundDto: GetRoundDto,
  ): Promise<Response<RoundEntity[]>> {
    return this.roundsService.findAll(getRoundDto, pageNumber, pageSize);
  }
}
