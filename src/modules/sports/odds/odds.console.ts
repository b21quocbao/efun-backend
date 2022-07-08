// eslint-disable-next-line
const moment = require('moment');
import { axiosInstance } from 'helpers/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { OddsService } from './odds.service';
import { SeasonsService } from '../seasons/seasons.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FixtureEntity } from '../fixtures/entities/fixture.entity';
import { MoreThan, Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class OddsConsole implements OnModuleInit {
  constructor(
    private readonly oddsService: OddsService,
    private readonly seasonsService: SeasonsService,
    @InjectRepository(FixtureEntity)
    private fixtureRepository: Repository<FixtureEntity>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const betSchedule = async () => {
      const bets = await axiosInstance.get('/odds/bets');

      if (bets.data && bets.data.response) {
        for (const item of bets.data.response) {
          await this.oddsService.updateOrCreateBet(
            {
              remoteId: item.id,
              name: item.name,
            },
            {
              remoteId: item.id,
            },
          );
        }
      }
    };

    const bookmakerSchedule = async () => {
      const bookmakers = await axiosInstance.get('/odds/bookmakers');

      if (bookmakers.data && bookmakers.data.response) {
        for (const item of bookmakers.data.response) {
          await this.oddsService.updateOrCreateBookmaker(
            {
              remoteId: item.id,
              name: item.name,
            },
            {
              remoteId: item.id,
            },
          );
        }
      }
    };

    const oddSchedule = async () => {
      const currentTime = moment.utc().unix();
      const fixtures = await this.fixtureRepository.find({
        where: {
          timestamp: MoreThan(currentTime),
          statusLong: 'Not Started',
          bcResult: false,
        },
        order: {
          timestamp: 'ASC',
        },
      });

      if (fixtures.length > 0) {
        for (const fixture of fixtures) {
          const meta = JSON.parse(fixture.meta);

          const odds = await axiosInstance.get(
            '/odds?season=' +
              meta.league.season +
              '&bookmaker=13&fixture=' +
              meta.fixture.id +
              '&league=' +
              meta.league.id,
          );

          if (odds.data && odds.data.response) {
            await this.fixtureRepository.update(fixture.id, {
              oddMeta: JSON.stringify(odds.data),
            });
          }
        }
      }
    };

    this.schedulerRegistry.addCronJob(
      'betSchedule',
      new CronJob(process.env.CRONT_COUNTRY, betSchedule),
    );
    this.schedulerRegistry.addCronJob(
      'bookmakerSchedule',
      new CronJob(process.env.CRONT_COUNTRY, bookmakerSchedule),
    );
    this.schedulerRegistry.addCronJob(
      'oddSchedule',
      new CronJob(process.env.CRONT_FIXTURE_H2H, oddSchedule),
    );
    this.schedulerRegistry.getCronJob('betSchedule').start();
    this.schedulerRegistry.getCronJob('bookmakerSchedule').start();
    this.schedulerRegistry.getCronJob('oddSchedule').start();
  }
}