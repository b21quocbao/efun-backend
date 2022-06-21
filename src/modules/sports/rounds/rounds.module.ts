import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';
import { RoundEntity } from './entities/round.entity';
import { RoundsConsole } from './rounds.console';
import { SeasonsModule } from '../seasons/seasons.module';
import { LeaguesModule } from '../leagues/leagues.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoundEntity]),
    LeaguesModule,
    SeasonsModule,
  ],
  controllers: [RoundsController],
  providers: [RoundsService, RoundsConsole],
  exports: [RoundsService],
})
export class RoundsModule {}
