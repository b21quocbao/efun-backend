import { axiosInstance } from 'helpers/axios';
import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { SeasonsService } from '../seasons/seasons.service';

@Console()
@Injectable()
export class LeaguesConsole {
  constructor(
    private readonly leaguesService: LeaguesService,
    private readonly seasonsService: SeasonsService,
  ) {}

  @Command({
    command: 'crawl-leagues',
  })
  async leagueSchedule() {
    try {
      // BEGIN - cron league
      const leagueIds = [4];
      const seasonStart = 2020;

      const allSeasons = await this.seasonsService.findAll({ seasonStart });

      if (allSeasons.total > 0) {
        for (const leagueId of leagueIds) {
          for (const season of allSeasons.data) {
            const leagues = await axiosInstance.get(
              '/leagues?season=' + season.year + '&id=' + leagueId,
            );

            if (
              leagues.data &&
              leagues.data.response &&
              leagues.data.response.length > 0
            ) {
              for (const item of leagues.data.response) {
                const getLeague = await this.leaguesService.findOneByName(
                  item.league.name,
                );

                let startDate = null;
                let endDate = null;

                if (item.seasons) {
                  for (const subItem of item.seasons) {
                    if (subItem.current == true) {
                      startDate = subItem.start;
                      endDate = subItem.end;
                    }
                  }
                }

                const league = getLeague?.id
                  ? await this.leaguesService.update(getLeague.id, {
                      remoteId: item.league.id,
                      name: item.league.name,
                      type: item.league.type,
                      logo: item.league.logo,
                      startDate: startDate,
                      endDate: endDate,
                      meta: JSON.stringify(item),
                    })
                  : await this.leaguesService.create({
                      remoteId: item.league.id,
                      name: item.league.name,
                      type: item.league.type,
                      logo: item.league.logo,
                      startDate: startDate,
                      endDate: endDate,
                      meta: JSON.stringify(item),
                    });

                if (item.seasons) {
                  for (const subItem of item.seasons) {
                    const getSeason = await this.seasonsService.findOneByYear(
                      subItem.year,
                    );

                    if (getSeason) {
                      if (!league.seasons) {
                        league.seasons = [];
                      }
                      league.seasons.push(getSeason);
                    }
                  }
                  await this.leaguesService.save(league);
                }
              }
            }
          }
        }
      }
      // END - cron league
    } catch (err) {
      console.log(err);
    }
  }
}
