// eslint-disable-next-line
const Web3 = require('web3');
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NavsService } from './navs.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import BigNumber from 'bignumber.js';

@Injectable()
export class NavsConsole implements OnModuleInit {
  private web3;

  constructor(
    private readonly navsService: NavsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.web3 = new Web3(process.env.RPC_URL);
  }

  onModuleInit() {
    const navSchedule = async () => {
      const { elpTokenABI } = await import(
        `../../shares/contracts/abi/${process.env.APP_ENV}/elpTokenABI`
      );

      const elpTokenContract = new this.web3.eth.Contract(
        elpTokenABI,
        process.env.ELP_TOKEN_PROXY,
      );
      try {
        const nav = await elpTokenContract.methods.currentNav().call();
        const capacity = await elpTokenContract.methods.capacity().call();
        await this.navsService.create({
          value: nav,
          capacity: new BigNumber(capacity).multipliedBy(nav).toString(),
        });
      } catch (err) {
        console.log(err);
      }
    };

    this.schedulerRegistry.addCronJob(
      'navSchedule',
      new CronJob(process.env.CRONT_NAV, navSchedule),
    );
    this.schedulerRegistry.getCronJob('navSchedule').start();
  }
}
