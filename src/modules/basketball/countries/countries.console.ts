import { axiosInstance } from 'src/modules/basketball/helper/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class CountriesConsole implements OnModuleInit {
  constructor(
    private readonly countriesService: CountriesService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const countrySchedule = async () => {
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
    };

    this.schedulerRegistry.addCronJob(
      'basketball_countrySchedule',
      new CronJob(process.env.BASKETBALL_CRONT_COUNTRY, countrySchedule),
    );
    this.schedulerRegistry.getCronJob('basketball_countrySchedule').start();
  }
}
