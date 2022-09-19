import { HTTPClient } from 'helpers/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class SeasonsConsole implements OnModuleInit {
  constructor(
    private readonly seasonsService: SeasonsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const seasonSchedule = async () => {
      const seasonStart = Number(process.env.SEASON_START);

      try {
        const seasons = await HTTPClient.getFootballInstance().client.get('/leagues/seasons');

        if (seasons.data && seasons.data.response) {
          for (const item of seasons.data.response) {
            if (item >= seasonStart) {
              const seasonRecord = { year: item };
              await this.seasonsService.updateOrCreate(
                seasonRecord,
                seasonRecord,
              );
            }
          }
        }
        // END - cron season
      } catch (err) {
        console.log(err);
      }
    };

    this.schedulerRegistry.addCronJob(
      'seasonSchedule',
      new CronJob(process.env.CRONT_SEASON, seasonSchedule),
    );
    this.schedulerRegistry.getCronJob('seasonSchedule').start();
  }
}
