import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { GameEntity } from './entities/game.entity';
import { GamesConsole } from './games.console';
import { SeasonsModule } from '../seasons/seasons.module';
import { CountriesModule } from '../countries/countries.module';
import { LeagueEntity } from '../leagues/entities/league.entity';
import { SeasonEntity } from '../seasons/entities/season.entity';
import { TeamEntity } from '../teams/entities/team.entity';
import { GoalEntity } from './entities/goal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GameEntity,
      LeagueEntity,
      SeasonEntity,
      TeamEntity,
      GoalEntity,
    ]),
    CountriesModule,
    SeasonsModule,
  ],
  controllers: [GamesController],
  providers: [GamesService, GamesConsole],
  exports: [GamesService],
})
export class GamesModule {}
