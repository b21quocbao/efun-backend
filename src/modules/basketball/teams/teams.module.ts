import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TeamEntity } from './entities/team.entity';
import { TeamsConsole } from './teams.console';
import { SeasonsModule } from '../seasons/seasons.module';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity]),
    CountriesModule,
    SeasonsModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService, TeamsConsole],
  exports: [TeamsService],
})
export class TeamsModule {}
