// eslint-disable-next-line
const moment = require('moment');
import { axiosInstance } from 'helpers/axios';
import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { OddsService } from './odds.service';
import { SeasonsService } from '../seasons/seasons.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FixtureEntity } from '../fixtures/entities/fixture.entity';
import { MoreThan, Repository } from 'typeorm';

@Console()
@Injectable()
export class OddsConsole {
  constructor(
    private readonly oddsService: OddsService,
    private readonly seasonsService: SeasonsService,
    @InjectRepository(FixtureEntity)
    private fixtureRepository: Repository<FixtureEntity>,
  ) {}

  @Command({
    command: 'crawl-bets',
  })
  async betSchedule() {
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
  }

  @Command({
    command: 'crawl-bookmakers',
  })
  async bookmakerSchedule() {
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
  }

  @Command({
    command: 'crawl-odds',
  })
  async oddSchedule() {
    const currentTime = moment.utc().unix();
    const fixtures = await this.fixtureRepository.find({
      where: {
        timestamp: MoreThan(currentTime),
        statusLong: 'Not Started',
        bcResult: false,
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
          fixture.oddMeta = JSON.stringify(odds.data);
          await this.fixtureRepository.save(fixture);
        }
      }
    }
  }
}
