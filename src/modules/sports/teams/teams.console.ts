import { axiosInstance } from 'helpers/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CountriesService } from '../countries/countries.service';
import { SeasonsService } from '../seasons/seasons.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class TeamsConsole implements OnModuleInit {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly seasonsService: SeasonsService,
    private readonly countriesService: CountriesService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.schedulerRegistry.addCronJob(
      'teamSchedule',
      new CronJob(process.env.CRONT_TEAM, this.teamSchedule),
    );
  }

  async teamSchedule() {
    try {
      // BEGIN - cron team
      const leagueIds = process.env.SPORT_LEAGUES.split(',').map((x) =>
        Number(x),
      );
      const seasonStart = Number(process.env.SEASON_START);

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
