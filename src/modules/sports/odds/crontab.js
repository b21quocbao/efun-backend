import _, { last } from 'lodash';
import axios from 'axios';
import moment from 'moment';
import config from 'src/config/config';
import apiFootballConfig from 'src/config/apiFootballConfig';
import betsRepository from 'src/modules/v1/odds/repositories/bets';
import bookmarkersRepository from 'src/modules/v1/odds/repositories/bookmarkers';
import fixturesRepository from 'src/modules/v1/fixtures/repositories/fixtures';

const crontab = {};

crontab.pullBets = async () => {
  const options = {
    method: 'get',
    url: apiFootballConfig.apiFootballHost + '/odds/bets',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  options.headers[apiFootballConfig.apiFootballHeaderKey] =
    apiFootballConfig.apiFootballKey;

  const bets = await axios(options);

  if (bets.data && bets.data.response) {
    for (const item of bets.data.response) {
      const betsModel = new betsRepository();
      await betsModel.updateOrCreate(
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

crontab.pullBookmarkers = async () => {
  const options = {
    method: 'get',
    url: apiFootballConfig.apiFootballHost + '/odds/bookmakers',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  options.headers[apiFootballConfig.apiFootballHeaderKey] =
    apiFootballConfig.apiFootballKey;

  const bookmakers = await axios(options);

  if (bookmakers.data && bookmakers.data.response) {
    for (const item of bookmakers.data.response) {
      const bookmakersModel = new bookmarkersRepository();
      await bookmakersModel.updateOrCreate(
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

crontab.pullAsianHandicap = async () => {
  const fixtureModel = new fixturesRepository();
  const currentTime = moment.utc().unix();
  const fixtures = await fixtureModel.findAll({
    where: {
      bcMatchId: {
        $gt: 0,
      },
      timestamp: {
        $gt: currentTime,
      },
      statusLong: 'Not Started',
      bcResult: false,
    },
  });

  if (fixtures.total > 0) {
    for (const fixture of fixtures.items) {
      const meta = JSON.parse(fixture.meta);
      const options = {
        method: 'get',
        url:
          apiFootballConfig.apiFootballHost +
          '/odds?season=' +
          meta.league.season +
          '&bet=4&bookmaker=13&fixture=' +
          meta.fixture.id +
          '&league=' +
          meta.league.id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      options.headers[apiFootballConfig.apiFootballHeaderKey] =
        apiFootballConfig.apiFootballKey;

      const odds = await axios(options);

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
          await fixture.save();
        }
      }
    }
  }
};

export default crontab;
