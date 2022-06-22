import { axiosInstance } from 'helpers/axios';
import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CountriesService } from '../countries/countries.service';
import { SeasonsService } from '../seasons/seasons.service';

@Console()
@Injectable()
export class TeamsConsole {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly seasonsService: SeasonsService,
    private readonly countriesService: CountriesService,
  ) {}

  @Command({
    command: 'crawl-teams',
  })
  async teamSchedule() {
    try {
      // BEGIN - cron team
      const leagueIds = process.env.SPORT_LEAGUES.split(',').map((x) =>
        Number(x),
      );
      const seasonStart = 2020;

      const allTeams = await this.seasonsService.findAll({
        seasonStart,
      });

      if (allTeams.total > 0) {
        for (const leagueId of leagueIds) {
          for (const team of allTeams.data) {
            const teamYear = team.year;
            const teams = await axiosInstance.get(
              '/teams?league=' + leagueId + '&season=' + teamYear,
            );

            if (teams.data && teams.data.response) {
              for (const item of teams.data.response) {
                if (item.team.country) {
                  const teamItem = item.team;
                  const getCountry = await this.countriesService.findOneByName(
                    teamItem.country,
                  );

                  this.teamsService.updateOrCreate(
                    {
                      countryId: getCountry ? getCountry.id : null,
                      remoteId: teamItem.id,
                      name: teamItem.name,
                      founded: teamItem.founded,
                      national: teamItem.national,
                      logo: teamItem.logo,
                      meta: JSON.stringify(item),
                    },
                    {
                      remoteId: teamItem.id,
                    },
                  );
                }
              }
            }
          }
        }
      }
      // END - cron team
    } catch (err) {
      console.log(err);
    }
  }
}
