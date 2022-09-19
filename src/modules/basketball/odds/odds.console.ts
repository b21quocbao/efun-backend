// eslint-disable-next-line
const moment = require('moment');
import { HTTPClient } from 'helpers/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { OddsService } from './odds.service';
import { SeasonsService } from '../seasons/seasons.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEntity } from '../games/entities/game.entity';
import { MoreThan, Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class OddsConsole implements OnModuleInit {
  constructor(
    private readonly oddsService: OddsService,
    private readonly seasonsService: SeasonsService,
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const betSchedule = async () => {
      const bets = await HTTPClient.getBasketballInstance().client.get('/odds/bets');

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
      const bookmakers = await HTTPClient.getBasketballInstance().client.get('/odds/bookmakers');

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
      const games = await this.gameRepository.find({
        where: {
          timestamp: MoreThan(currentTime),
          statusLong: 'Not Started',
          bcResult: false,
        },
        order: {
          lastUpdateOdd: 'ASC',
        },
        take: 30,
      });

      if (games.length > 0) {
        for (const game of games) {
          const meta = JSON.parse(game.meta);

          const odds = await HTTPClient.getBasketballInstance().client.get(
            '/odds?season=' +
              meta.league.season +
              '&bookmaker=13&game=' +
              meta.game.id +
              '&league=' +
              meta.league.id,
          );

          if (odds.data && odds.data.response) {
            await this.gameRepository.update(game.id, {
              oddMeta: JSON.stringify(odds.data),
              lastUpdateOdd: new Date(),
            });
          }
        }
      }
    };

    this.schedulerRegistry.addCronJob(
      'basketball_betSchedule',
      new CronJob(process.env.BASKETBALL_CRONT_COUNTRY, betSchedule),
    );
    this.schedulerRegistry.addCronJob(
      'basketball_bookmakerSchedule',
      new CronJob(process.env.BASKETBALL_CRONT_COUNTRY, bookmakerSchedule),
    );
    this.schedulerRegistry.addCronJob(
      'basketball_oddSchedule',
      new CronJob(process.env.BASKETBALL_CRONT_GAME_ODD, oddSchedule),
    );
    this.schedulerRegistry.getCronJob('basketball_betSchedule').start();
    this.schedulerRegistry.getCronJob('basketball_bookmakerSchedule').start();
    this.schedulerRegistry.getCronJob('basketball_oddSchedule').start();
  }
}
