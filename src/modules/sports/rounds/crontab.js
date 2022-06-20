import _ from 'lodash';
import axios from 'axios';
import apiFootballConfig from 'src/config/apiFootballConfig';
import leaguesRepository from 'src/modules/v1/leagues/repositories/leagues';
import roundsRepository from 'src/modules/v1/rounds/repositories/rounds';
import seasonsRepository from 'src/modules/v1/seasons/repositories/seasons';

const crontab = {};

crontab.roundSchedule = async () => {
  try {
    // BEGIN - cron round
    if (apiFootballConfig.leagueIds) {
      const seasonModel = new seasonsRepository();
      const leagueModel = new leaguesRepository();
      const allSeasons = await seasonModel.findAll({
        where: {
          year: {
            $gte: apiFootballConfig.seasonStart,
          },
        },
      });

      if (allSeasons.total > 0) {
        for (const leagueId of apiFootballConfig.leagueIds) {
          const league = await leagueModel.findOne({
            where: {
              remoteId: leagueId,
            },
          });

          for (const season of allSeasons.items) {
            const seasonYear = season.year;

            if (season && league) {
              const roundModel = new roundsRepository();
              const roundUrl =
                apiFootballConfig.apiFootballHost +
                '/fixtures/rounds?league=' +
                leagueId +
                '&season=' +
                seasonYear;
              let configRound = {
                method: 'get',
                url: roundUrl,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
              };

              configRound.headers[apiFootballConfig.apiFootballHeaderKey] =
                apiFootballConfig.apiFootballKey;

              const rounds = await axios(configRound);
              const currentRoundUrl = roundUrl + '&current=true';
              configRound.url = currentRoundUrl;
              const currentRounds = await axios(configRound);

              if (rounds.data && rounds.data.response) {
                for (const item of rounds.data.response) {
                  const name = item.replace('Regular Season', 'Round');
                  const roundRecord = {
                    leagueId: league.id,
                    seasonId: season.id,
                    name: name,
                    current:
                      currentRounds.data.response &&
                      currentRounds.data.response.includes(item) == true
                        ? true
                        : false,
                  };
                  await roundModel.updateOrCreate(roundRecord, {
                    leagueId: league.id,
                    seasonId: season.id,
                    name: name,
                  });
                }
              }
            }
          }
        }
      }
    }
    // END - cron round
  } catch (err) {
    console.log(err);
  }
};

export default crontab;
