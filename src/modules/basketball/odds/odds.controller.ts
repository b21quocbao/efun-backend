import { Controller, Get, Query } from '@nestjs/common';
import { OddsService } from './odds.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { BetEntity } from './entities/bet.entity';
import { GetBetDto } from './dto/get-bet.dto';
import { GetBookmakerDto } from './dto/get-bookmaker.dto';
import { BookmakerEntity } from './entities/bookmaker.entity';

@ApiTags('Basketball Odds')
@Controller('basketball/odds')
export class OddsController {
  constructor(private readonly oddsService: OddsService) {}

  @Get('bets')
  async findAllBets(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() getBetDto: GetBetDto,
  ): Promise<Response<BetEntity[]>> {
    return this.oddsService.findAllBet(getBetDto, pageNumber, pageSize);
  }

  @Get('bookmakers')
  async findAllBookmakers(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() getBookmakerDto: GetBookmakerDto,
  ): Promise<Response<BookmakerEntity[]>> {
    return this.oddsService.findAllBookmaker(
      getBookmakerDto,
      pageNumber,
      pageSize,
    );
  }
}
