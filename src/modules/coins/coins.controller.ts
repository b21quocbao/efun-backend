import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoinsService } from './coins.service';
import { GetAllCointDto } from './dto/get-coin.dto';

@ApiTags('Coins')
@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  @Get()
  async findAll(@Query() request: GetAllCointDto) {
    return this.coinsService.findAll(request);
  }

  @Get('symbol/:symbol')
  async findOneBySymbol(@Param('symbol') symbol: string) {
    return this.coinsService.findOneBySymbol(symbol);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coinsService.findOne(+id);
  }
}
