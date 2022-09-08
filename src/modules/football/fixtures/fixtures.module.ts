import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixturesService } from './fixtures.service';
import { FixturesController } from './fixtures.controller';
import { FixtureEntity } from './entities/fixture.entity';
import { FixturesConsole } from './fixtures.console';
import { SeasonsModule } from '../seasons/seasons.module';
import { CountriesModule } from '../countries/countries.module';
import { LeagueEntity } from '../leagues/entities/league.entity';
import { SeasonEntity } from '../seasons/entities/season.entity';
import { RoundEntity } from '../rounds/entities/round.entity';
import { TeamEntity } from '../teams/entities/team.entity';
import { GoalEntity } from './entities/goal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FixtureEntity,
      LeagueEntity,
      SeasonEntity,
      RoundEntity,
      TeamEntity,
      GoalEntity,
    ]),
    CountriesModule,
    SeasonsModule,
  ],
  controllers: [FixturesController],
  providers: [FixturesService, FixturesConsole],
  exports: [FixturesService],
})
export class FixturesModule {}
