import { CountriesModule } from './countries/countries.module';
import { CountryEntity } from './countries/entities/country.entity';
import { GameEntity } from './games/entities/game.entity';
import { GoalEntity } from './games/entities/goal.entity';
import { GamesModule } from './games/games.module';
import { LeagueEntity } from './leagues/entities/league.entity';
import { LeaguesModule } from './leagues/leagues.module';
import { BetEntity } from './odds/entities/bet.entity';
import { BookmakerEntity } from './odds/entities/bookmaker.entity';
import { OddsModule } from './odds/odds.module';
import { SeasonEntity } from './seasons/entities/season.entity';
import { SeasonsModule } from './seasons/seasons.module';
import { TeamEntity } from './teams/entities/team.entity';
import { TeamsModule } from './teams/teams.module';

export const BasketballEntities = [
  CountryEntity,
  SeasonEntity,
  LeagueEntity,
  TeamEntity,
  GameEntity,
  GoalEntity,
  BetEntity,
  BookmakerEntity,
];
export const BasketballModules = [
  CountriesModule,
  SeasonsModule,
  LeaguesModule,
  TeamsModule,
  GamesModule,
  OddsModule,
];
