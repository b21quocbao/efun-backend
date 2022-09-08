import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OddsService } from './odds.service';
import { OddsController } from './odds.controller';
import { BetEntity } from './entities/bet.entity';
import { BookmakerEntity } from './entities/bookmaker.entity';
import { OddsConsole } from './odds.console';
import { SeasonsModule } from '../seasons/seasons.module';
import { CountriesModule } from '../countries/countries.module';
import { GameEntity } from '../games/entities/game.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BetEntity, BookmakerEntity, GameEntity]),
    CountriesModule,
    SeasonsModule,
  ],
  controllers: [OddsController],
  providers: [OddsService, OddsConsole],
  exports: [OddsService],
})
export class OddsModule {}
