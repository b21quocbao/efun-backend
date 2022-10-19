// eslint-disable-next-line
const Web3 = require('web3');
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NavsService } from './navs.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class NavsConsole implements OnModuleInit {
  constructor(
    private readonly navsService: NavsService,
    private schedulerRegistry: SchedulerRegistry,
    private web3,
  ) {
    this.web3 = new Web3(process.env.RPC_URL);
  }

  onModuleInit() {
    const navSchedule = async () => {
      const { elpABI } = await import(
        `../../shares/contracts/abi/${process.env.APP_ENV}/elpABI`
      );

      const elpContract = new this.web3.eth.Contract(
        elpABI,
        process.env.ELP_PROXY,
      );
      try {
        const nav = await elpContract.methods.currentNav().call();
        await this.navsService.create({ value: nav });
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
