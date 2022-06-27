import { axiosInstance } from 'helpers/axios';
import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { SeasonsService } from '../seasons/seasons.service';
import { CountriesService } from '../countries/countries.service';

@Console()
@Injectable()
export class LeaguesConsole {
  constructor(
    private readonly leaguesService: LeaguesService,
    private readonly seasonsService: SeasonsService,
    private readonly coutriesService: CountriesService,
  ) {}

  @Command({
    command: 'crawl-leagues',
  })
  async leagueSchedule() {
    try {
      // BEGIN - cron league
      const leagueIds = process.env.SPORT_LEAGUES.split(',').map((x) =>
        Number(x),
      );
      const seasonStart = Number(process.env.SEASON_START);

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
                const getCountry = await this.coutriesService.findOneByName(
                  item.country.name,
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

                const league = await this.leaguesService.updateOrCreate(
                  {
                    countryId: getCountry ? getCountry.id : null,
                    remoteId: item.league.id,
                    name: item.league.name,
                    type: item.league.type,
                    logo: item.league.logo,
                    startDate: startDate,
                    endDate: endDate,
                    meta: JSON.stringify(item),
                  },
                  {
                    remoteId: item.league.id,
                  },
                );

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
