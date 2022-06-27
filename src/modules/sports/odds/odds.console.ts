// eslint-disable-next-line
const moment = require('moment');
import { axiosInstance } from 'helpers/axios';
import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { OddsService } from './odds.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FixtureEntity } from '../fixtures/entities/fixture.entity';
import { MoreThan, Repository } from 'typeorm';

@Console()
@Injectable()
export class OddsConsole {
  constructor(
    private readonly oddsService: OddsService,
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
    command: 'crawl-asian-handicap',
  })
  async asianHandicapSchedule() {
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
            '&bet=4&bookmaker=13&fixture=' +
            meta.fixture.id +
            '&league=' +
            meta.league.id,
        );

        if (odds.data && odds.data.response) {
          let homeHandicap = null;
          let awayHandicap = null;
          let homeOdd = null;
          let awayOdd = null;

          for (const item of odds.data.response) {
            if (item.bookmakers) {
              for (const bookmaker of item.bookmakers) {
                if (bookmaker.bets) {
                  for (const bet of bookmaker.bets) {
                    if (bet.values) {
                      for (const valItem of bet.values) {
                        const valSplit = valItem.value.split(' ');
                        const team = valSplit[0];
                        const handicap = valSplit[1];

                        if (team == 'Home') {
                          if (homeHandicap === null) {
                            homeHandicap = handicap;
                            awayHandicap = 0;
                          }
                          if (homeOdd === null) {
                            homeOdd = valItem.odd;
                          }
                        } else {
                          if (awayHandicap === null) {
                            homeHandicap = 0;
                            awayHandicap = handicap;
                          }
                          if (awayOdd === null) {
                            awayOdd = valItem.odd;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          if (
            homeHandicap !== null &&
            awayHandicap !== null &&
            homeOdd !== null &&
            awayOdd !== null
          ) {
            fixture.homeHandicap = homeHandicap;
            fixture.awayHandicap = awayHandicap;
            fixture.homeOdd = homeOdd;
            fixture.awayOdd = awayOdd;
            fixture.asianHandicapMeta = JSON.stringify(odds.data);
            await this.fixtureRepository.save(fixture);
          }
        }
      }
    }
  }
}
