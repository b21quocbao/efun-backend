import { Module } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinsController } from './coins.controller';
import { CoinsConsole } from './coins.console';
import { CoinEntity } from './entities/coin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CoinEntity]), Boolean],
  controllers: [CoinsController],
  providers: [CoinsService, CoinsConsole],
  exports: [CoinsService],
})
export class CoinsModule {}
