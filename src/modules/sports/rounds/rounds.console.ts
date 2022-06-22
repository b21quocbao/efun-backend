import { axiosInstance } from 'helpers/axios';
import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { SeasonsService } from '../seasons/seasons.service';
import { LeaguesService } from '../leagues/leagues.service';

@Console()
@Injectable()
export class RoundsConsole {
  constructor(
    private readonly roundsService: RoundsService,
    private readonly seasonsService: SeasonsService,
    private readonly leaguesService: LeaguesService,
  ) {}

  @Command({
    command: 'crawl-rounds',
  })
  async roundSchedule() {
    const leagueIds = process.env.SPORT_LEAGUES.split(',').map((x) =>
      Number(x),
    );
    const seasonStart = 2020;

    try {
      // BEGIN - cron round
      if (leagueIds) {
        const allSeasons = await this.seasonsService.findAll({ seasonStart });

        if (allSeasons.total > 0) {
          for (const leagueId of leagueIds) {
            const league = await this.leaguesService.findOneByRemoteId(
              leagueId,
            );

            for (const season of allSeasons.data) {
              const seasonYear = season.year;

              if (season && league) {
                const roundUrl =
                  '/fixtures/rounds?league=' +
                  leagueId +
                  '&season=' +
                  seasonYear;
                const rounds = await axiosInstance.get(roundUrl);
                const currentRounds = await axiosInstance.get(
                  roundUrl + '&current=true',
                );

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
                    await this.roundsService.updateOrCreate(roundRecord, {
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
  }
}
