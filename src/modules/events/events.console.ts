// eslint-disable-next-line
const Web3 = require('web3');
import { Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { ContractEvent } from 'src/shares/contracts/constant';
import { crawlSmartcontractEvents } from 'src/shares/helpers/smartcontract';
import { LatestBlockService } from '../latest-block/latest-block.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { EventsService } from './events.service';
import { AbiItem } from 'web3-utils';
import { eventABI } from 'src/shares/contracts/abi/eventABI';

@Console()
@Injectable()
export class EventConsole {
  private web3;

  constructor(
    private readonly eventsService: EventsService,
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
    private readonly latestBlockService: LatestBlockService,
  ) {
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));
  }

  @Command({
    command: 'create-events <statingBlock>',
  })
  async createEvents(statingBlock = 0): Promise<void> {
    const web3 = new Web3(process.env.RPC_URL);

    const contract = new web3.eth.Contract(
      eventABI as AbiItem[],
      process.env.EVENT_PROXY,
    );
    const eventHandler = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.idx}`);
      console.log(event.returnValues, 'Line #54 events.console.ts');
      console.log(
        ['MULTIPLE_CHOICES_PROXY', 'GROUP_PREDICT_PROXY', 'HANDICAP_PROXY']
          .map((e) => process.env[e].toLowerCase())
          .includes(event.returnValues.helperAddress.toLowerCase()),
      );

      const user = await this.usersService.findByAddress(
        event.returnValues.creator,
      );
      const eventEnitty = await this.eventsService.findOne(
        event.returnValues.idx,
      );
      const receipt = await web3.eth.getTransactionReceipt(
        event.transactionHash,
      );

      if (
        user &&
        eventEnitty &&
        ['MULTIPLE_CHOICES_PROXY', 'GROUP_PREDICT_PROXY', 'HANDICAP_PROXY']
          .map((e) => process.env[e].toLowerCase())
          .includes(event.returnValues.helperAddress.toLowerCase())
      ) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.eventsService.update(eventEnitty.id, {
          startTime: event.returnValues.startTime,
          deadline: event.returnValues.deadlineTime,
          endTime: event.returnValues.endTime,
          options: JSON.stringify(event.returnValues.options.data),
          odds: JSON.stringify(event.returnValues.options.odds),
          userId: user.id,
          transactionId: transaction.id,
        });
      }
    };

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.EventCreated,
      eventHandler,
    );
  }

  @Command({
    command: 'update-result <statingBlock>',
  })
  async updateResult(statingBlock = 0): Promise<void> {
    const web3 = new Web3(process.env.RPC_URL);

    const contract = new web3.eth.Contract(
      eventABI as AbiItem[],
      process.env.EVENT_PROXY,
    );
    const eventHandler = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.eventId}`);

      const user = await this.usersService.findByAddress(
        event.returnValues.caller,
      );
      const eventEnitty = await this.eventsService.findOne(
        event.returnValues.eventId,
      );
      const receipt = await web3.eth.getTransactionReceipt(
        event.transactionHash,
      );

      if (user && eventEnitty) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.eventsService.update(eventEnitty.id, {
          result: event.returnValues.result,
          transactionId: transaction.id,
        });
      }
    };

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.EventResultUpdated,
      eventHandler,
    );
  }
}
