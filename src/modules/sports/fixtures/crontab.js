import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import config from 'src/config/config';
import apiFootballConfig from 'src/config/apiFootballConfig';
import fixturesRepository from 'src/modules/v1/fixtures/repositories/fixtures';
import goalsRepository from 'src/modules/v1/fixtures/repositories/goals';
import leaguesRepository from 'src/modules/v1/leagues/repositories/leagues';
import roundsRepository from 'src/modules/v1/rounds/repositories/rounds';
import seasonsRepository from 'src/modules/v1/seasons/repositories/seasons';
import teamsRepository from 'src/modules/v1/teams/repositories/teams';
import blockchain from 'src/common/blockchain';
import { CreateFixtureDto } from './dto/create-fixture.dto';
import { UpdateFixtureDto } from './dto/update-fixture.dto';

const crontab = {
  checkCondTriggerCreateMatch: undefined as any,
  autoCreateMatchBC: undefined as any,
  fixtureSchedule: undefined as any,
  h2hFixtureSchedule: undefined as any,
  runUpdateMatchResult: undefined as any,
};

crontab.checkCondTriggerCreateMatch = (fixture) => {
  let flag = false;

  if (
    typeof fixture.bcMatchId != 'undefined' &&
    fixture.bcMatchId == null &&
    config.enableAutoCreateMatch == 1
  ) {
    const now = moment.utc();
    const destTime = moment
      .utc()
      .add(parseInt(config.createMatchDurationDay), 'days');

    if (fixture.date >= now && fixture.date <= destTime) {
      flag = true;
    }
  }

  return flag;
};

crontab.autoCreateMatchBC = async (fixtureId) => {
  const fixtureModel = new fixturesRepository();
  const getFixture = await fixtureModel.findOne({
    where: {
      id: fixtureId,
    },
  });

  if (
    getFixture &&
    getFixture.statusLong != 'Match Postponed' &&
    getFixture.statusLong != 'Match Cancelled'
  ) {
    const Descriptions = getFixture.id;
    const EndTime = getFixture.timestamp;
    const initWeb3Contract = blockchain.initWeb3Contract();
    const endTime = EndTime - 600;
    const descriptions = [Descriptions].map((item) => {
      return initWeb3Contract.web3.utils.asciiToHex(item);
    });

    const queryCreateMatch = initWeb3Contract.contract.methods.createMatches(
      descriptions,
      [1623171248],
      [endTime],
    );
    const match = await blockchain.sendMethod(
      queryCreateMatch,
      initWeb3Contract.web3,
      initWeb3Contract.contract,
      initWeb3Contract.account,
      200000,
    );
    const event = await initWeb3Contract.contract.getPastEvents(
      'MatchCreated',
      {
        fromBlock: match.blockNumber,
        toBlock: match.blockNumber,
      },
    );

    if (typeof event != 'undefined' && event.length > 0) {
      const firstEvent = event[0];

      if (firstEvent) {
        const matchId = firstEvent.returnValues.idx;
        const initWeb3ContractMatch = blockchain.initWeb3Contract();
        const info = await initWeb3ContractMatch.contract.methods
          .info(parseInt(matchId))
          .call();

        if (info.description && info.endTime) {
          const bcFixtureId = initWeb3ContractMatch.web3.utils.hexToAscii(
            info.description,
          );

          return await fixtureModel.update(
            {
              bcMatchId: matchId,
              bcMatchMeta: JSON.stringify({
                matchId: matchId,
                descriptions: Descriptions,
                endTime: endTime,
              }),
            },
            {
              where: {
                id: parseInt(bcFixtureId),
                timestamp: parseInt(info.endTime) + 600,
              },
            },
          );
        }
      }
    }

    return event;
  }
};

crontab.fixtureSchedule = async () => {
  try {
    // BEGIN - cron fixture
    const leagueModel = new leaguesRepository();
    const seasonModel = new seasonsRepository();
    const roundModel = new roundsRepository();
    const teamModel = new teamsRepository();
    const goalModel = new goalsRepository();
    const fixtureModel = new fixturesRepository();

    const allLeagues = await leagueModel.findAll();

    if (allLeagues.total > 0) {
      for (const league of allLeagues.items) {
        const meta = JSON.parse(league.meta);

        if (meta.seasons.length > 0) {
          for (const metaSeason of meta.seasons) {
            if (metaSeason.current == true) {
              const getSeason = await seasonModel.findOne({
                where: {
                  year: metaSeason.year,
                },
              });

              if (getSeason) {
                const configFixture = {
                  method: 'get',
                  url:
                    apiFootballConfig.apiFootballHost +
                    '/fixtures?league=' +
                    league.remoteId +
                    '&season=' +
                    getSeason.year,
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                };

                configFixture.headers[apiFootballConfig.apiFootballHeaderKey] =
                  apiFootballConfig.apiFootballKey;

                const fixtures = await axios(configFixture);

                if (fixtures.data && fixtures.data.response) {
                  for (const item of fixtures.data.response) {
                    const fixtureItemDetail = item.fixture;

                    const pushData: CreateFixtureDto = {
                      countryId: league.countryId,
                      leagueId: league.id,
                      seasonId: getSeason.id,
                      roundId: null,
                      teamHomeId: null,
                      teamAwayId: null,
                      teamWinnerId: null,
                      remoteId: fixtureItemDetail.id,
                      referee: fixtureItemDetail.referee,
                      timezone: fixtureItemDetail.timezone,
                      date: fixtureItemDetail.date,
                      timestamp: fixtureItemDetail.timestamp,
                      periodsFirst: fixtureItemDetail.periods.first,
                      periodsSecond: fixtureItemDetail.periods.second,
                      venueRemoteId: fixtureItemDetail.venue.id,
                      venueName: fixtureItemDetail.venue.name,
                      venueCity: fixtureItemDetail.venue.city,
                      statusLong: fixtureItemDetail.status.long,
                      statusShort: fixtureItemDetail.status.short,
                      statusElapsed: fixtureItemDetail.status.elapsed,
                      fixtureMeta: JSON.stringify(item.fixture),
                      leagueMeta: JSON.stringify(item.league),
                      teamsMeta: JSON.stringify(item.teams),
                      goalsMeta: JSON.stringify(item.goals),
                      scoreMeta: JSON.stringify(item.score),
                      meta: JSON.stringify(item),
                    };

                    const roundName = item.league.round.replace(
                      'Regular Season',
                      'Round',
                    );
                    const getRound = await roundModel.findOne({
                      where: {
                        leagueId: league.id,
                        seasonId: getSeason.id,
                        name: roundName,
                      },
                    });

                    if (getRound) {
                      pushData.roundId = getRound.id;
                    }

                    if (typeof item.teams.home.id != 'undefined') {
                      const getTeamHome = await teamModel.findOne({
                        where: {
                          remoteId: item.teams.home.id,
                        },
                      });

                      if (getTeamHome) {
                        pushData.teamHomeId = getTeamHome.id;
                      }
                    }
                    if (typeof item.teams.away.id != 'undefined') {
                      const getTeamAway = await teamModel.findOne({
                        where: {
                          remoteId: item.teams.away.id,
                        },
                      });

                      if (getTeamAway) {
                        pushData.teamAwayId = getTeamAway.id;
                      }
                    }
                    if (
                      typeof item.teams.home.id != 'undefined' &&
                      typeof item.teams.away.id != 'undefined' &&
                      item.teams.home.winner != null &&
                      item.teams.away.winner != null
                    ) {
                      if (item.teams.home.winner == true) {
                        pushData.teamWinnerId = pushData.teamHomeId;
                      } else {
                        pushData.teamWinnerId = pushData.teamAwayId;
                      }
                    }

                    const fixture = await fixtureModel.updateOrCreate(
                      pushData,
                      {
                        remoteId: fixtureItemDetail.id,
                      },
                    );

                    await goalModel.updateOrCreate(
                      {
                        fixtureId: fixture.id,
                        type: 'goals',
                        subType: null,
                        home: item.goals.home,
                        away: item.goals.away,
                      },
                      {
                        fixtureId: fixture.id,
                        type: 'goals',
                        subType: null,
                      },
                    );

                    for (const subType in item.score) {
                      const subItem = item.score[subType];

                      await goalModel.updateOrCreate(
                        {
                          fixtureId: fixture.id,
                          type: 'score',
                          subType: subType,
                          home: subItem.home,
                          away: subItem.away,
                        },
                        {
                          fixtureId: fixture.id,
                          type: 'score',
                          subType: subType,
                        },
                      );
                    }

                    if (crontab.checkCondTriggerCreateMatch(fixture) == true) {
                      await crontab.autoCreateMatchBC(fixture.id);
                    }

                    global.io.emit(
                      'fixture',
                      await fixtureModel.findById(fixture.id),
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
    // END - cron fixture
  } catch (err) {
    console.log(err);
  }
};

crontab.h2hFixtureSchedule = async () => {
  try {
    // BEGIN - cron fixture h2h
    const goalModel = new goalsRepository();
    const fixtureModel = new fixturesRepository();
    const destTime = moment.utc().add(300, 'minutes');
    const fixtureNeedCheck = await fixtureModel.findAll({
      where: {
        statusLong: {
          $ne: 'Match Finished',
        },
        date: {
          $lte: destTime,
        },
      },
    });

    if (fixtureNeedCheck.total > 0) {
      for (const fixture of fixtureNeedCheck.items) {
        if (fixture.teamsMeta != '') {
          const teamMeta = JSON.parse(fixture.teamsMeta);

          if (
            typeof teamMeta.home.id != 'undefined' &&
            typeof teamMeta.away.id != 'undefined'
          ) {
            const leagueMeta = JSON.parse(fixture.leagueMeta);
            const fixtureDate = moment(new Date(fixture.date)).format(
              'YYYY-MM-DD',
            );
            const configH2H = {
              method: 'get',
              url:
                apiFootballConfig.apiFootballHost +
                '/fixtures/headtohead?league=' +
                leagueMeta.id +
                '&season=' +
                leagueMeta.season +
                '&h2h=' +
                teamMeta.home.id +
                '-' +
                teamMeta.away.id +
                '&date=' +
                fixtureDate,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            };

            configH2H.headers[apiFootballConfig.apiFootballHeaderKey] =
              apiFootballConfig.apiFootballKey;

            const fixturesFootballAPI = await axios(configH2H);

            if (fixturesFootballAPI.data && fixturesFootballAPI.data.response) {
              for (const item of fixturesFootballAPI.data.response) {
                const fixtureItemDetail = item.fixture;

                const updateData: UpdateFixtureDto = {
                  teamWinnerId: null,
                  referee: fixtureItemDetail.referee,
                  timezone: fixtureItemDetail.timezone,
                  date: fixtureItemDetail.date,
                  timestamp: fixtureItemDetail.timestamp,
                  periodsFirst: fixtureItemDetail.periods.first,
                  periodsSecond: fixtureItemDetail.periods.second,
                  venueRemoteId: fixtureItemDetail.venue.id,
                  venueName: fixtureItemDetail.venue.name,
                  venueCity: fixtureItemDetail.venue.city,
                  statusLong: fixtureItemDetail.status.long,
                  statusShort: fixtureItemDetail.status.short,
                  statusElapsed: fixtureItemDetail.status.elapsed,
                  fixtureMeta: JSON.stringify(item.fixture),
                  leagueMeta: JSON.stringify(item.league),
                  teamsMeta: JSON.stringify(item.teams),
                  goalsMeta: JSON.stringify(item.goals),
                  scoreMeta: JSON.stringify(item.score),
                  meta: JSON.stringify(item),
                };

                if (
                  typeof item.teams.home.id != 'undefined' &&
                  typeof item.teams.away.id != 'undefined' &&
                  item.teams.home.winner != null &&
                  item.teams.away.winner != null
                ) {
                  if (item.teams.home.winner == true) {
                    updateData.teamWinnerId = fixture.teamHomeId;
                  } else {
                    updateData.teamWinnerId = fixture.teamAwayId;
                  }
                }

                await fixtureModel.update(updateData, {
                  where: { id: fixture.id },
                });
                await goalModel.updateOrCreate(
                  {
                    fixtureId: fixture.id,
                    type: 'goals',
                    subType: null,
                    home: item.goals.home,
                    away: item.goals.away,
                  },
                  {
                    fixtureId: fixture.id,
                    type: 'goals',
                    subType: null,
                  },
                );

                for (const subType in item.score) {
                  const subItem = item.score[subType];

                  await goalModel.updateOrCreate(
                    {
                      fixtureId: fixture.id,
                      type: 'score',
                      subType: subType,
                      home: subItem.home,
                      away: subItem.away,
                    },
                    {
                      fixtureId: fixture.id,
                      type: 'score',
                      subType: subType,
                    },
                  );
                }

                const fixtureRefresh = await fixtureModel.findById(fixture.id);

                if (config.enableAutoUpdateResult == 1) {
                  await crontab.runUpdateMatchResult(fixtureRefresh);
                }

                global.io.emit('fixture', fixtureRefresh);
              }
            }
          }
        }
      }
    }
    // END - cron fixture h2h
  } catch (err) {
    console.log(err);
  }
};

crontab.runUpdateMatchResult = async (fixtureRefresh) => {
  if (
    config.enableAutoUpdateResult == 1 &&
    typeof fixtureRefresh.bcMatchId != 'undefined' &&
    fixtureRefresh.bcMatchId != '' &&
    fixtureRefresh.bcMatchId != null &&
    fixtureRefresh.statusLong == 'Match Finished' &&
    fixtureRefresh.bcResult == false
  ) {
    const goals = JSON.parse(fixtureRefresh.scoreMeta);
    const goalHome =
      typeof goals.fulltime.home != 'undefined' &&
      goals.fulltime.home != '' &&
      goals.fulltime.home != null
        ? goals.fulltime.home
        : 0;
    const goalAway =
      typeof goals.fulltime.away != 'undefined' &&
      goals.fulltime.away != '' &&
      goals.fulltime.away != null
        ? goals.fulltime.away
        : 0;

    const initWeb3Contract = blockchain.initWeb3Contract('match');

    // Send function updateMatchScores on Blockchain
    const queryUpdateMatchScores =
      initWeb3Contract.contract.methods.updateMatchScores(
        [fixtureRefresh.bcMatchId],
        [goalHome],
        [goalAway],
      );
    const updateScore = await blockchain.sendMethod(
      queryUpdateMatchScores,
      initWeb3Contract.web3,
      initWeb3Contract.contract,
      initWeb3Contract.account,
    );

    // Send function updateMatchStatuses on Blockchain
    // {NOT_EXISTED, AVAILABLE, FINISH, CANCEL, SUSPEND}
    const queryUpdateMatchStatuses =
      initWeb3Contract.contract.methods.updateMatchStatuses(
        [fixtureRefresh.bcMatchId],
        [2],
      );
    const updateStatus = await blockchain.sendMethod(
      queryUpdateMatchStatuses,
      initWeb3Contract.web3,
      initWeb3Contract.contract,
      initWeb3Contract.account,
    );

    if (updateScore && updateStatus) {
      const fixtureModel = new fixturesRepository();
      return await fixtureModel.update(
        {
          bcResult: true,
          bcResultMeta: JSON.stringify({
            id: fixtureRefresh.id,
            matchId: fixtureRefresh.bcMatchId,
            goalHome: goalHome,
            goalAway: goalAway,
            status: 2,
          }),
        },
        {
          where: { id: fixtureRefresh.id },
        },
      );
    }
  }
};

export default crontab;
