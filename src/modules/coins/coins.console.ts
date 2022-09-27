import axios from 'axios';
import { CoinsService } from './coins.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class CoinsConsole implements OnModuleInit {
  private flag: boolean;

  constructor(
    private readonly coinsService: CoinsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const coinSchedule = async () => {
      const res = await axios(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?aux=num_market_pairs',
        {
          headers: {
            'X-CMC_PRO_API_KEY': this.flag
              ? process.env.COINMARKETCAP_API_KEY
              : process.env.COINMARKETCAP_API_KEY_2 &&
                process.env.COINMARKETCAP_API_KEY_2.length > 0
              ? process.env.COINMARKETCAP_API_KEY_2
              : process.env.COINMARKETCAP_API_KEY,
          },
        },
      );
      const { data } = res;
      if (data.status.error_code == 0 && data.data && data.data.length > 0) {
        for (const coin of data.data) {
          this.coinsService.create({
            symbol: coin.symbol,
            name: coin.name,
            rate: coin.quote.USD.price,
            volume: coin.quote.USD.volume_24h,
            logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
          });
        }
      }

      this.flag = !this.flag;
    };

    this.schedulerRegistry.addCronJob(
      'coinSchedule',
      new CronJob(process.env.CRONT_COIN, coinSchedule),
    );
    this.schedulerRegistry.getCronJob('coinSchedule').start();
  }
}
