import { axiosInstance } from 'helpers/axios';
import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { SeasonsService } from './seasons.service';

@Console()
@Injectable()
export class SeasonsConsole {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Command({
    command: 'crawl-seasons',
  })
  async seasonSchedule() {
    const seasonStart = 2020;

    try {
      const seasons = await axiosInstance.get('/leagues/seasons');

      if (seasons.data && seasons.data.response) {
        for (const item of seasons.data.response) {
          if (item >= seasonStart) {
            const seasonRecord = { year: item };
            await this.seasonsService.createOrUpdate(seasonRecord);
          }
        }
      }
      // END - cron season
    } catch (err) {
      console.log(err);
    }
  }
}
