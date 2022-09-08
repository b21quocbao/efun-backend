import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';
import { SeasonEntity } from './entities/season.entity';
import { SeasonsConsole } from './seasons.console';

@Module({
  imports: [TypeOrmModule.forFeature([SeasonEntity])],
  controllers: [SeasonsController],
  providers: [SeasonsService, SeasonsConsole],
  exports: [SeasonsService],
})
export class SeasonsModule {}
