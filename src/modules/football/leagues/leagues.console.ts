import { HTTPClient } from 'helpers/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { SeasonsService } from '../seasons/seasons.service';
import { CountriesService } from '../countries/countries.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ranking } from 'helpers/ranking';

@Injectable()
export class LeaguesConsole implements OnModuleInit {
  constructor(
    private readonly leaguesService: LeaguesService,
    private readonly seasonsService: SeasonsService,
    private readonly coutriesService: CountriesService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const leagueSchedule = async () => {
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
              const leagues = await HTTPClient.getFootballInstance().client.get(
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
                      order: ranking[item.league.id],
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
    };

    this.schedulerRegistry.addCronJob(
      'leagueSchedule',
      new CronJob(process.env.CRONT_LEAGUE, leagueSchedule),
    );
    this.schedulerRegistry.getCronJob('leagueSchedule').start();
  }
}
