import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoinsService } from './coins.service';

@ApiTags('Coins')
@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  @Get()
  async findAll() {
    return this.coinsService.findAll();
  }

  @Get('symbol/:symbol')
  async findOneBySymbol(@Param('symbol') symbol: string) {
    return this.coinsService.findOneBySymbol(symbol);
  }

  @Get('text/:search')
  async findOneByText(@Param('search') search: string) {
    return this.coinsService.findOneByText(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coinsService.findOne(+id);
  }
}
