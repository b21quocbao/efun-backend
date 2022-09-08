import { CountriesModule } from './countries/countries.module';
import { CountryEntity } from './countries/entities/country.entity';
import { FixtureEntity } from './fixtures/entities/fixture.entity';
import { GoalEntity } from './fixtures/entities/goal.entity';
import { FixturesModule } from './fixtures/fixtures.module';
import { LeagueEntity } from './leagues/entities/league.entity';
import { LeaguesModule } from './leagues/leagues.module';
import { BetEntity } from './odds/entities/bet.entity';
import { BookmakerEntity } from './odds/entities/bookmaker.entity';
import { OddsModule } from './odds/odds.module';
import { RoundEntity } from './rounds/entities/round.entity';
import { RoundsModule } from './rounds/rounds.module';
import { SeasonEntity } from './seasons/entities/season.entity';
import { SeasonsModule } from './seasons/seasons.module';
import { TeamEntity } from './teams/entities/team.entity';
import { TeamsModule } from './teams/teams.module';

export const FootballEntities = [
  CountryEntity,
  SeasonEntity,
  LeagueEntity,
  TeamEntity,
  RoundEntity,
  FixtureEntity,
  GoalEntity,
  BetEntity,
  BookmakerEntity,
];
export const FootballModules = [
  CountriesModule,
  SeasonsModule,
  LeaguesModule,
  RoundsModule,
  TeamsModule,
  FixturesModule,
  OddsModule,
];
