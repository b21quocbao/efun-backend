import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { CountryEntity } from './entities/country.entity';
import { CountriesConsole } from './countries.console';

@Module({
  imports: [TypeOrmModule.forFeature([CountryEntity])],
  controllers: [CountriesController],
  providers: [CountriesService, CountriesConsole],
  exports: [CountriesService],
})
export class CountriesModule {}
