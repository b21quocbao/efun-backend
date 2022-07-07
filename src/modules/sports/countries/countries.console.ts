import { axiosInstance } from 'helpers/axios';
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
    this.schedulerRegistry.addCronJob(
      'countrySchedule',
      new CronJob(process.env.CRONT_COUNTRY, this.countrySchedule),
    );
  }

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
