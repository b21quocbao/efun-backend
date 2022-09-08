import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaguesService } from './leagues.service';
import { LeaguesController } from './leagues.controller';
import { LeagueEntity } from './entities/league.entity';
import { LeaguesConsole } from './leagues.console';
import { SeasonsModule } from '../seasons/seasons.module';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeagueEntity]),
    SeasonsModule,
    CountriesModule,
  ],
  controllers: [LeaguesController],
  providers: [LeaguesService, LeaguesConsole],
  exports: [LeaguesService],
})
export class LeaguesModule {}
