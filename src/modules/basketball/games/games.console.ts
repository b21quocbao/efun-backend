// eslint-disable-next-line
const moment = require('moment');
import { axiosInstance } from 'src/modules/basketball/helper/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { GamesService } from './games.service';
import { GameEntity } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LeagueEntity } from '../leagues/entities/league.entity';
import { SeasonEntity } from '../seasons/entities/season.entity';
import { LessThanOrEqual, Not, Repository } from 'typeorm';
import { TeamEntity } from '../teams/entities/team.entity';
import { SUB_TYPE, TYPE } from './entities/goal.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class GamesConsole implements OnModuleInit {
  constructor(
    // BEGIN - cron game
    @InjectRepository(LeagueEntity)
    private leagueRepository: Repository<LeagueEntity>,
    @InjectRepository(SeasonEntity)
    private seasonRepository: Repository<SeasonEntity>,
    @InjectRepository(TeamEntity)
    private teamRepository: Repository<TeamEntity>,
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    private readonly gamesService: GamesService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const gameSchedule = async () => {
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
                    const games = await axiosInstance.get(
                      '/games?league=' +
                        league.remoteId +
                        '&season=' +
                        getSeason.year,
                    );

                    if (games.data && games.data.response) {
                      for (const item of games.data.response) {
                        const gameItemDetail = item.game;

                        const pushData: CreateGameDto = {
                          countryId: league.countryId,
                          leagueId: league.id,
                          seasonId: getSeason.id,
                          teamHomeId: null,
                          teamAwayId: null,
                          teamWinnerId: null,
                          remoteId: gameItemDetail.id,
                          referee: gameItemDetail.referee,
                          timezone: gameItemDetail.timezone,
                          date: gameItemDetail.date,
                          timestamp: gameItemDetail.timestamp,
                          periodsFirst: gameItemDetail.periods.first,
                          periodsSecond: gameItemDetail.periods.second,
                          venueRemoteId: gameItemDetail.venue.id,
                          venueName: gameItemDetail.venue.name,
                          venueCity: gameItemDetail.venue.city,
                          statusLong: gameItemDetail.status.long,
                          statusShort: gameItemDetail.status.short,
                          statusElapsed: gameItemDetail.status.elapsed,
                          gameMeta: JSON.stringify(item.game),
                          leagueMeta: JSON.stringify(item.league),
                          teamsMeta: JSON.stringify(item.teams),
                          goalsMeta: JSON.stringify(item.goals),
                          scoreMeta: JSON.stringify(item.score),
                          meta: JSON.stringify(item),
                        };

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

                        const game = await this.gamesService.updateOrCreate(
                          pushData,
                          {
                            remoteId: gameItemDetail.id,
                          },
                        );

                        await this.gamesService.updateOrCreateGoal(
                          {
                            gameId: game.id,
                            type: TYPE.goals,
                            subType: null,
                            home: item.goals.home,
                            away: item.goals.away,
                          },
                          {
                            gameId: game.id,
                            type: TYPE.goals,
                            subType: null,
                          },
                        );

                        for (const subType in item.score) {
                          const subItem = item.score[subType];

                          await this.gamesService.updateOrCreateGoal(
                            {
                              gameId: game.id,
                              type: TYPE.score,
                              subType: subType as SUB_TYPE,
                              home: subItem.home,
                              away: subItem.away,
                            },
                            {
                              gameId: game.id,
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
        // END - cron game
      } catch (err) {
        console.log(err);
      }
    };

    const h2hGameSchedule = async () => {
      try {
        // BEGIN - cron game h2h
        const destTime = moment.utc().add(300, 'minutes');
        const gameNeedCheck = await this.gameRepository.find({
          where: {
            statusLong: Not('Match Finished'),
            date: LessThanOrEqual(destTime),
          },
        });

        if (gameNeedCheck.length > 0) {
          for (const game of gameNeedCheck) {
            if (game.teamsMeta != '') {
              const teamMeta = JSON.parse(game.teamsMeta);

              if (
                typeof teamMeta.home.id != 'undefined' &&
                typeof teamMeta.away.id != 'undefined'
              ) {
                const leagueMeta = JSON.parse(game.leagueMeta);
                const gameDate = moment(new Date(game.date)).format(
                  'YYYY-MM-DD',
                );

                const gamesFootballAPI = await axiosInstance.get(
                  '/games/headtohead?league=' +
                    leagueMeta.id +
                    '&season=' +
                    leagueMeta.season +
                    '&h2h=' +
                    teamMeta.home.id +
                    '-' +
                    teamMeta.away.id +
                    '&date=' +
                    gameDate,
                );

                if (gamesFootballAPI.data && gamesFootballAPI.data.response) {
                  for (const item of gamesFootballAPI.data.response) {
                    const gameItemDetail = item.game;

                    const updateData: UpdateGameDto = {
                      teamWinnerId: null,
                      referee: gameItemDetail.referee,
                      timezone: gameItemDetail.timezone,
                      date: gameItemDetail.date,
                      timestamp: gameItemDetail.timestamp,
                      periodsFirst: gameItemDetail.periods.first,
                      periodsSecond: gameItemDetail.periods.second,
                      venueRemoteId: gameItemDetail.venue.id,
                      venueName: gameItemDetail.venue.name,
                      venueCity: gameItemDetail.venue.city,
                      statusLong: gameItemDetail.status.long,
                      statusShort: gameItemDetail.status.short,
                      statusElapsed: gameItemDetail.status.elapsed,
                      gameMeta: JSON.stringify(item.game),
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
                        updateData.teamWinnerId = game.teamHomeId;
                      } else {
                        updateData.teamWinnerId = game.teamAwayId;
                      }
                    }

                    await this.gameRepository.update(game.id, updateData);
                    await this.gamesService.updateOrCreateGoal(
                      {
                        gameId: game.id,
                        type: TYPE.goals,
                        subType: null,
                        home: item.goals.home,
                        away: item.goals.away,
                      },
                      {
                        gameId: game.id,
                        type: TYPE.goals,
                        subType: null,
                      },
                    );

                    for (const subType in item.score) {
                      const subItem = item.score[subType];

                      await this.gamesService.updateOrCreateGoal(
                        {
                          gameId: game.id,
                          type: TYPE.score,
                          subType: subType as SUB_TYPE,
                          home: subItem.home,
                          away: subItem.away,
                        },
                        {
                          gameId: game.id,
                          type: TYPE.score,
                          subType: subType as SUB_TYPE,
                        },
                      );
                    }

                    const gameRefresh = await this.gamesService.findOne(
                      game.id,
                    );

                    await runUpdateMatchResult(gameRefresh);
                  }
                }
              }
            }
          }
        }
        // END - cron game h2h
      } catch (err) {
        console.log(err);
      }
    };

    const runUpdateMatchResult = async (game: GameEntity) => {
      if (game.statusLong == 'Match Finished' && game.bcResult == false) {
        const goals = JSON.parse(game.scoreMeta);
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

        return await this.gameRepository.update(game.id, {
          bcResult: true,
          bcResultMeta: JSON.stringify({
            id: game.id,
            goalHome: goalHome,
            goalAway: goalAway,
            status: 2,
          }),
        });
      }
    };

    this.schedulerRegistry.addCronJob(
      'basketball_gameSchedule',
      new CronJob(process.env.BASKETBALL_CRONT_GAME, gameSchedule),
    );
    this.schedulerRegistry.addCronJob(
      'basketball_h2hGameSchedule',
      new CronJob(process.env.BASKETBALL_CRONT_GAME_H2H, h2hGameSchedule),
    );
    this.schedulerRegistry.getCronJob('basketball_gameSchedule').start();
    this.schedulerRegistry.getCronJob('basketball_h2hGameSchedule').start();
  }
}
