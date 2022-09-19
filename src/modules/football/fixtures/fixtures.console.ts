// eslint-disable-next-line
const moment = require('moment');
import { HTTPClient } from 'helpers/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { FixturesService } from './fixtures.service';
import { FixtureEntity } from './entities/fixture.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LeagueEntity } from '../leagues/entities/league.entity';
import { SeasonEntity } from '../seasons/entities/season.entity';
import { LessThanOrEqual, Not, Repository } from 'typeorm';
import { RoundEntity } from '../rounds/entities/round.entity';
import { TeamEntity } from '../teams/entities/team.entity';
import { SUB_TYPE, TYPE } from './entities/goal.entity';
import { CreateFixtureDto } from './dto/create-fixture.dto';
import { UpdateFixtureDto } from './dto/update-fixture.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class FixturesConsole implements OnModuleInit {
  constructor(
    // BEGIN - cron fixture
    @InjectRepository(LeagueEntity)
    private leagueRepository: Repository<LeagueEntity>,
    @InjectRepository(SeasonEntity)
    private seasonRepository: Repository<SeasonEntity>,
    @InjectRepository(RoundEntity)
    private roundRepository: Repository<RoundEntity>,
    @InjectRepository(TeamEntity)
    private teamRepository: Repository<TeamEntity>,
    @InjectRepository(FixtureEntity)
    private fixtureRepository: Repository<FixtureEntity>,
    private readonly fixturesService: FixturesService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const fixtureSchedule = async () => {
      try {
        const allLeagues = await this.leagueRepository.find();

        if (allLeagues.length > 0) {
          for (const league of allLeagues) {
            const meta = JSON.parse(league.meta);

            if (meta.seasons.length > 0) {
              for (const metaSeason of meta.seasons) {
                if (metaSeason.current == true) {
                  const getSeason = await this.seasonRepository.findOne({
                    where: {
                      year: metaSeason.year,
                    },
                  });

                  if (getSeason) {
                    const fixtures =
                      await HTTPClient.getFootballInstance().client.get(
                        '/fixtures?league=' +
                          league.remoteId +
                          '&season=' +
                          getSeason.year,
                      );

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
                        const getRound = await this.roundRepository.findOne({
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
                          const getTeamHome = await this.teamRepository.findOne(
                            {
                              where: {
                                remoteId: item.teams.home.id,
                              },
                            },
                          );

                          if (getTeamHome) {
                            pushData.teamHomeId = getTeamHome.id;
                          }
                        }
                        if (typeof item.teams.away.id != 'undefined') {
                          const getTeamAway = await this.teamRepository.findOne(
                            {
                              where: {
                                remoteId: item.teams.away.id,
                              },
                            },
                          );

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

                        const fixture =
                          await this.fixturesService.updateOrCreate(pushData, {
                            remoteId: fixtureItemDetail.id,
                          });

                        await this.fixturesService.updateOrCreateGoal(
                          {
                            fixtureId: fixture.id,
                            type: TYPE.goals,
                            subType: null,
                            home: item.goals.home,
                            away: item.goals.away,
                          },
                          {
                            fixtureId: fixture.id,
                            type: TYPE.goals,
                            subType: null,
                          },
                        );

                        for (const subType in item.score) {
                          const subItem = item.score[subType];

                          await this.fixturesService.updateOrCreateGoal(
                            {
                              fixtureId: fixture.id,
                              type: TYPE.score,
                              subType: subType as SUB_TYPE,
                              home: subItem.home,
                              away: subItem.away,
                            },
                            {
                              fixtureId: fixture.id,
                              type: TYPE.score,
                              subType: subType as SUB_TYPE,
                            },
                          );
                        }
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

    const h2hFixtureSchedule = async () => {
      try {
        // BEGIN - cron fixture h2h
        const destTime = moment.utc().add(300, 'minutes');
        const fixtureNeedCheck = await this.fixtureRepository.find({
          where: {
            statusLong: Not('Match Finished'),
            date: LessThanOrEqual(destTime),
          },
        });

        if (fixtureNeedCheck.length > 0) {
          for (const fixture of fixtureNeedCheck) {
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

                const fixturesFootballAPI =
                  await HTTPClient.getFootballInstance().client.get(
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
                  );

                if (
                  fixturesFootballAPI.data &&
                  fixturesFootballAPI.data.response
                ) {
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

                    await this.fixtureRepository.update(fixture.id, updateData);
                    await this.fixturesService.updateOrCreateGoal(
                      {
                        fixtureId: fixture.id,
                        type: TYPE.goals,
                        subType: null,
                        home: item.goals.home,
                        away: item.goals.away,
                      },
                      {
                        fixtureId: fixture.id,
                        type: TYPE.goals,
                        subType: null,
                      },
                    );

                    for (const subType in item.score) {
                      const subItem = item.score[subType];

                      await this.fixturesService.updateOrCreateGoal(
                        {
                          fixtureId: fixture.id,
                          type: TYPE.score,
                          subType: subType as SUB_TYPE,
                          home: subItem.home,
                          away: subItem.away,
                        },
                        {
                          fixtureId: fixture.id,
                          type: TYPE.score,
                          subType: subType as SUB_TYPE,
                        },
                      );
                    }

                    const fixtureRefresh = await this.fixturesService.findOne(
                      fixture.id,
                    );

                    await runUpdateMatchResult(fixtureRefresh);
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

    const runUpdateMatchResult = async (fixture: FixtureEntity) => {
      if (fixture.statusLong == 'Match Finished' && fixture.bcResult == false) {
        const goals = JSON.parse(fixture.scoreMeta);
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

        return await this.fixtureRepository.update(fixture.id, {
          bcResult: true,
          bcResultMeta: JSON.stringify({
            id: fixture.id,
            goalHome: goalHome,
            goalAway: goalAway,
            status: 2,
          }),
        });
      }
    };

    this.schedulerRegistry.addCronJob(
      'fixtureSchedule',
      new CronJob(process.env.CRONT_FIXTURE, fixtureSchedule),
    );
    this.schedulerRegistry.addCronJob(
      'h2hFixtureSchedule',
      new CronJob(process.env.CRONT_FIXTURE_H2H, h2hFixtureSchedule),
    );
    this.schedulerRegistry.getCronJob('fixtureSchedule').start();
    this.schedulerRegistry.getCronJob('h2hFixtureSchedule').start();
  }
}
