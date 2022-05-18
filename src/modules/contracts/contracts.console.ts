// eslint-disable-next-line
const Web3 = require('web3');
import { Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { ContractEvent } from 'src/shares/contracts/constant';
import { crawlSmartcontractEvents } from 'src/shares/helpers/smartcontract';
import { LatestBlockService } from '../latest-block/latest-block.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { AbiItem } from 'web3-utils';
import { eventABI } from 'src/shares/contracts/abi/eventABI';
import { EventsService } from '../events/events.service';
import { PredictionsService } from '../predictions/predictions.service';
import { RewardsService } from '../rewards/rewards.service';
import { predictionABI } from 'src/shares/contracts/abi/predictionABI';
import { EventType } from '../events/enums/event-type.enum';
import { EventStatus } from '../events/enums/event-status.enum';
import { PoolsService } from '../pools/pools.service';

@Console()
@Injectable()
export class ContractConsole {
  private web3;

  constructor(
    private readonly eventsService: EventsService,
    private readonly predictionsService: PredictionsService,
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
    private readonly latestBlockService: LatestBlockService,
    private readonly rewardsService: RewardsService,
    private readonly poolsService: PoolsService,
  ) {
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));
  }

  @Command({
    command: 'create-events <statingBlock>',
  })
  async createEvents(statingBlock = 0): Promise<void> {
    const contract = new this.web3.eth.Contract(
      eventABI as AbiItem[],
      process.env.EVENT_PROXY,
    );
    const eventHandler = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.idx}`);

      const user = await this.usersService.findByAddress(
        event.returnValues.creator,
      );
      const eventEnitty = await this.eventsService.findOne(
        event.returnValues.idx,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
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
          startTime: new Date(event.returnValues.startTime * 1000),
          deadline: new Date(event.returnValues.deadlineTime * 1000),
          endTime: new Date(event.returnValues.endTime * 1000),
          options: JSON.stringify(event.returnValues.options.data),
          odds: JSON.stringify(event.returnValues.options.odds),
          status: EventStatus.AVAILABLE,
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
    const contract = new this.web3.eth.Contract(
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
      const receipt = await this.web3.eth.getTransactionReceipt(
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
          status: EventStatus.FINISH,
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

  @Command({
    command: 'create-prediction <statingBlock>',
  })
  async createPrediction(statingBlock = 0): Promise<void> {
    const contract = new this.web3.eth.Contract(
      predictionABI as AbiItem[],
      process.env.PREDICTION_PROXY,
    );
    const eventHandler = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.eventId}`);
      const user = await this.usersService.findByAddress(
        event.returnValues.user,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );

      if (user) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.predictionsService.create({
          eventId: event.returnValues.eventId,
          userId: user.id,
          transactionId: transaction.id,
          option: event.returnValues.option,
          token: event.returnValues.token,
          amount: event.returnValues.amount,
        });
      }
    };

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.PredictionCreated,
      eventHandler,
    );
  }

  @Command({
    command: 'create-reward <statingBlock>',
  })
  async createReward(statingBlock = 0): Promise<void> {
    const contract = new this.web3.eth.Contract(
      predictionABI as AbiItem[],
      process.env.PREDICTION_PROXY,
    );
    const eventHandler = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.eventId}`);
      const user = await this.usersService.findByAddress(
        event.returnValues.user,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );

      if (user) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.rewardsService.create({
          eventId: event.returnValues.eventId,
          userId: user.id,
          transactionId: transaction.id,
          token: event.returnValues.token,
          amount: event.returnValues.amount,
        });
      }
    };

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.RewardClaimed,
      eventHandler,
    );
  }

  @Command({
    command: 'create-lp <statingBlock>',
  })
  async createLP(statingBlock = 0): Promise<void> {
    const contract = new this.web3.eth.Contract(
      predictionABI as AbiItem[],
      process.env.PREDICTION_PROXY,
    );
    const eventHandler = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.eventId}`);
      const user = await this.usersService.findByAddress(
        event.returnValues.user,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );

      if (user) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.poolsService.create({
          userId: user.id,
          transactionId: transaction.id,
          token: event.returnValues.token,
          amount: event.returnValues.amount,
        });
      }
    };

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.RewardClaimed,
      eventHandler,
    );
  }

  @Command({
    command: 'crawl-all <statingBlock>',
  })
  async crawlAll(statingBlock = 0): Promise<void> {
    await Promise.all([
      this.createEvents(statingBlock),
      this.updateResult(statingBlock),
      this.createPrediction(statingBlock),
      this.createReward(statingBlock),
      this.createLP(statingBlock),
    ]);
  }

  @Command({
    command: 'seed-event',
  })
  async seedEvent(): Promise<void> {
    await this.eventsService.create({
      userId: 1,
      name: 'PL Winner',
      thumbnailUrl:
        'https://media.bongda.com.vn/files/hai.phan/2022/05/18/man-city-vs-liverpool-0843.jpg',
      categoryId: 2,
      type: EventType.GroupPredict,
      startTime: new Date(Date.now() + 5 * 60 * 1000),
      deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      endTime: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      options: '["Liverpool","Man City"]',
      odds: '[0,0]',
      description: 'Which team will be PL Winner',
      shortDescription: 'PL Winner Team',
    });
  }
}
