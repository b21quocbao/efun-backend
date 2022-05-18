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
  ) {
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));
  }

  async createEventsEventHandler(event): Promise<void> {
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
        startTime: event.returnValues.startTime,
        deadline: event.returnValues.deadlineTime,
        endTime: event.returnValues.endTime,
        options: JSON.stringify(event.returnValues.options.data),
        odds: JSON.stringify(event.returnValues.options.odds),
        userId: user.id,
        transactionId: transaction.id,
      });
    }
  }

  async updateResultEventHandler(event): Promise<void> {
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
        transactionId: transaction.id,
      });
    }
  }

  async createPredictionEventHandler(event): Promise<void> {
    console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
    console.log(`Handle item with id ${event.returnValues.eventId}`);
    const user = await this.usersService.findByAddress(event.returnValues.user);
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
  }

  async createRewardEventHandler(event): Promise<void> {
    console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
    console.log(`Handle item with id ${event.returnValues.eventId}`);
    const user = await this.usersService.findByAddress(event.returnValues.user);
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
  }

  @Command({
    command: 'create-events <statingBlock>',
  })
  async createEvents(statingBlock = 0): Promise<void> {
    const contract = new this.web3.eth.Contract(
      eventABI as AbiItem[],
      process.env.EVENT_PROXY,
    );

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.EventCreated,
      this.createEventsEventHandler,
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

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.EventResultUpdated,
      this.updateResultEventHandler,
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

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.PredictionCreated,
      this.createPredictionEventHandler,
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

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.RewardClaimed,
      this.createRewardEventHandler,
    );
  }

  @Command({
    command: 'crawl-all <statingBlock>',
  })
  async crawlAll(statingBlock = 0): Promise<void> {
    const contract1 = new this.web3.eth.Contract(
      eventABI as AbiItem[],
      process.env.EVENT_PROXY,
    );

    const contract2 = new this.web3.eth.Contract(
      predictionABI as AbiItem[],
      process.env.PREDICTION_PROXY,
    );

    console.log('Starting', 'Line #244 contracts.console.ts');

    await Promise.all([
      crawlSmartcontractEvents(
        Number(statingBlock),
        this.web3,
        this.latestBlockService,
        contract1,
        ContractEvent.EventCreated,
        this.createEventsEventHandler,
      ),
      crawlSmartcontractEvents(
        Number(statingBlock),
        this.web3,
        this.latestBlockService,
        contract1,
        ContractEvent.EventResultUpdated,
        this.updateResultEventHandler,
      ),
      crawlSmartcontractEvents(
        Number(statingBlock),
        this.web3,
        this.latestBlockService,
        contract2,
        ContractEvent.PredictionCreated,
        this.createPredictionEventHandler,
      ),
      crawlSmartcontractEvents(
        Number(statingBlock),
        this.web3,
        this.latestBlockService,
        contract2,
        ContractEvent.RewardClaimed,
        this.createRewardEventHandler,
      ),
    ]);
  }
}
