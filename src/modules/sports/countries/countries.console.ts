import { axiosInstance } from 'helpers/axios';
import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Console()
@Injectable()
export class CountriesConsole {
  constructor(private readonly countriesService: CountriesService) {}

  @Command({
    command: 'crawl-countries',
  })
  async countrySchedule() {
    try {
      const countries = await axiosInstance.get('/countries');

      if (countries.data && countries.data.response) {
        for (const item of countries.data.response) {
          await this.countriesService.updateOrCreate(
            {
              name: item.name,
              code: item.code,
              flag: item.flag,
            },
            {
              name: item.name,
            },
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}
