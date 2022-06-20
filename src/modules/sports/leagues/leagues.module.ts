import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaguesService } from './leagues.service';
import { LeaguesController } from './leagues.controller';
import { LeagueEntity } from './entities/league.entity';
import { LeaguesConsole } from './leagues.console';
import { SeasonsModule } from '../seasons/seasons.module';

@Module({
  imports: [TypeOrmModule.forFeature([LeagueEntity]), SeasonsModule],
  controllers: [LeaguesController],
  providers: [LeaguesService, LeaguesConsole],
})
export class LeaguesModule {}
