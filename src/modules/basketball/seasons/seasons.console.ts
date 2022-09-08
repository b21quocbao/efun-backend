import { axiosInstance } from 'src/modules/basketball/helper/axios';
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
      const seasonStart = Number(process.env.BASKETBALL_SEASON_START);

      try {
        const seasons = await axiosInstance.get('/seasons');

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
      'basketball_seasonSchedule',
      new CronJob(process.env.BASKETBALL_CRONT_SEASON, seasonSchedule),
    );
    this.schedulerRegistry.getCronJob('basketball_seasonSchedule').start();
  }
}
