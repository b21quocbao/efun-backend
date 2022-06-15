// eslint-disable-next-line
const Web3 = require('web3');
import { Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { ContractEvent } from 'src/shares/contracts/constant';
import {
  crawlSmartcontractEvents,
  crawlSmartcontractEventsBatch,
} from 'src/shares/helpers/smartcontract';
import { LatestBlockService } from '../latest-block/latest-block.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { AbiItem } from 'web3-utils';
import { eventABI } from 'src/shares/contracts/abi/eventABI';
import { EventsService } from '../events/events.service';
import { PredictionsService } from '../predictions/predictions.service';
import { predictionABI } from 'src/shares/contracts/abi/predictionABI';
import { EventType } from '../events/enums/event-type.enum';
import { EventStatus } from '../events/enums/event-status.enum';
import { PoolsService } from '../pools/pools.service';
import axios from 'axios';

@Console()
@Injectable()
export class ContractConsole {
  private web3;
  private eventHandler1;
  private eventHandler2;
  private eventHandler3;
  private eventHandler4;
  private eventHandler5;
  private eventHandler6;
  private eventHandler7;

  constructor(
    private readonly eventsService: EventsService,
    private readonly predictionsService: PredictionsService,
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
    private readonly latestBlockService: LatestBlockService,
    private readonly poolsService: PoolsService,
  ) {
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));

    this.eventHandler1 = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.idx}`);

      const user = await this.usersService.findByAddress(
        event.returnValues.creator,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );
      const transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );

      if (
        user &&
        [
          'MULTIPLE_CHOICES_PROXY',
          'GROUP_PREDICT_PROXY',
          'HANDICAP_PROXY',
          'OVER_UNDER_PROXY',
        ]
          .map((e) => process.env[e].toLowerCase())
          .includes(event.returnValues.helperAddress.toLowerCase()) &&
        !transactionEntity
      ) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          receipt: JSON.stringify(receipt),
          blockNumber: receipt?.blockNumber,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });
        const { data: result } = await axios.get(event.returnValues.datas);
        console.log(result, 'Line #80 contracts.console.ts');

        await this.eventsService.create(user.id, {
          id: event.returnValues.idx,
          startTime: new Date(event.returnValues.startTime * 1000),
          deadline: new Date(event.returnValues.deadlineTime * 1000),
          endTime: new Date(event.returnValues.endTime * 1000),
          odds: JSON.stringify(event.returnValues.odds),
          transactionId: transaction.id,
          options: result.options,
          name: result.name,
          thumbnailUrl: result.thumbnailUrl,
          bannerUrl: result.bannerUrl.length ? result.bannerUrl : undefined,
          categoryId: Number(result.categoryId),
          subCategoryId: result.subCategoryId.length
            ? Number(result.subCategoryId)
            : undefined,
          competitionId: Number(result.competitionId),
          type: result.type,
          marketType: result.marketType.length ? result.marketType : undefined,
          description: result.description,
          metadata: result.metadata,
          shortDescription: result.shortDescription,
          streamUrl: result.streamUrl.length ? result.streamUrl : undefined,
        });
      }
    };

    this.eventHandler2 = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.eventId}`);

      const user = await this.usersService.findByAddress(
        event.returnValues.caller,
      );
      const eventEntity = await this.eventsService.findOne(
        event.returnValues.eventId,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );
      const transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );

      if (user && eventEntity && !transactionEntity) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          receipt: JSON.stringify(receipt),
          blockNumber: receipt?.blockNumber,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.eventsService.update(eventEntity.id, {
          result: JSON.parse(eventEntity.options)[event.returnValues.index],
          status: EventStatus.FINISH,
          transactionId: transaction.id,
        });
      }
    };

    this.eventHandler3 = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.eventId}`);
      const user = await this.usersService.findByAddress(
        event.returnValues.user,
      );
      const eventEntity = await this.eventsService.findOne(
        event.returnValues.eventId,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );
      const transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );

      if (user && eventEntity && !transactionEntity) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          receipt: JSON.stringify(receipt),
          blockNumber: receipt?.blockNumber,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.predictionsService.create({
          eventId: event.returnValues.eventId,
          userId: user.id,
          predictNum: event.returnValues.predictNum,
          transactionId: transaction.id,
          optionIndex: event.returnValues.optionIndex,
          token: event.returnValues.token,
          amount: event.returnValues.amount,
        });
      }
    };

    this.eventHandler4 = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.eventId}`);
      const user = await this.usersService.findByAddress(
        event.returnValues.user,
      );
      const eventEntity = await this.eventsService.findOne(
        event.returnValues.eventId,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );
      const transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );
      const prediction = await this.predictionsService.findByPredictNum(
        event.returnValues.predictNum,
        user.id,
        event.returnValues.token,
        event.returnValues.eventId,
      );

      if (user && eventEntity && prediction && !transactionEntity) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          receipt: JSON.stringify(receipt),
          blockNumber: receipt?.blockNumber,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.predictionsService.update(prediction.id, {
          rewardTransactionId: transaction.id,
          rewardAmount: event.returnValues.reward,
        });
      }
    };

    this.eventHandler5 = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.eventId}`);
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );
      const transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );
      const eventEntity = await this.eventsService.findOne(
        event.returnValues.eventId,
      );
      const pool = await this.poolsService.findByEventToken(
        event.returnValues.eventId,
        event.returnValues.token,
      );

      if (eventEntity && !transactionEntity) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          receipt: JSON.stringify(receipt),
          blockNumber: receipt?.blockNumber,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        if (pool) {
          await this.poolsService.update(pool.id, {
            amount: event.returnValues.amount,
          });
        } else {
          await this.poolsService.create({
            eventId: event.returnValues.eventId,
            transactionId: transaction.id,
            token: event.returnValues.token,
            amount: event.returnValues.amount,
          });
        }
      }
    };

    this.eventHandler6 = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.eventId}`);
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );
      const transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );
      const eventEntity = await this.eventsService.findOne(
        event.returnValues.eventId,
      );
      const pool = await this.poolsService.findByEventToken(
        event.returnValues.eventId,
        event.returnValues.token,
      );

      if (eventEntity && !transactionEntity && pool) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          receipt: JSON.stringify(receipt),
          blockNumber: receipt?.blockNumber,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.poolsService.update(pool.id, {
          claimAmount: event.returnValues.amount,
          claimTransactionId: transaction.id,
        });
      }
    };

    this.eventHandler7 = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.eventId}`);
      const user = await this.usersService.findByAddress(
        event.returnValues.user,
      );
      const eventEntity = await this.eventsService.findOne(
        event.returnValues.eventId,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );
      const transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );
      const prediction = await this.predictionsService.findByPredictNum(
        event.returnValues.predictNum,
        user.id,
        event.returnValues.token,
        event.returnValues.eventId,
      );

      if (user && eventEntity && prediction && !transactionEntity) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          receipt: JSON.stringify(receipt),
          blockNumber: receipt?.blockNumber,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.predictionsService.update(prediction.id, {
          cashBackTransactionId: transaction.id,
        });
      }
    };
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
      this.eventHandler1,
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
      this.eventHandler2,
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
      this.eventHandler3,
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
      this.eventHandler4,
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

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.LPDeposited,
      this.eventHandler5,
    );
  }

  @Command({
    command: 'claim-lp <statingBlock>',
  })
  async claimLP(statingBlock = 0): Promise<void> {
    const contract = new this.web3.eth.Contract(
      predictionABI as AbiItem[],
      process.env.PREDICTION_PROXY,
    );

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.LPClaimed,
      this.eventHandler6,
    );
  }

  @Command({
    command: 'create-cashback <statingBlock>',
  })
  async createCashBack(statingBlock = 0): Promise<void> {
    const contract = new this.web3.eth.Contract(
      predictionABI as AbiItem[],
      process.env.PREDICTION_PROXY,
    );

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.CashBackClaimed,
      this.eventHandler7,
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

    await crawlSmartcontractEventsBatch(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      [contract1, contract1, contract2, contract2, contract2],
      [
        ContractEvent.EventCreated,
        ContractEvent.EventResultUpdated,
        ContractEvent.PredictionCreated,
        ContractEvent.RewardClaimed,
        ContractEvent.LPDeposited,
        ContractEvent.LPClaimed,
        ContractEvent.CashBackClaimed,
      ],
      [
        this.eventHandler1,
        this.eventHandler2,
        this.eventHandler3,
        this.eventHandler4,
        this.eventHandler5,
        this.eventHandler6,
        this.eventHandler7,
      ],
    );
  }

  // @Command({
  //   command: 'seed-event',
  // })
  // async seedEvent(): Promise<void> {
  //   await this.eventsService.create(1, {
  //     name: 'PL Winner',
  //     metadata: '',
  //     thumbnailUrl:
  //       'https://media.bongda.com.vn/files/hai.phan/2022/05/18/man-city-vs-liverpool-0843.jpg',
  //     categoryId: 2,
  //     type: EventType.GroupPredict,
  //     startTime: new Date(Date.now() + 5 * 60 * 1000),
  //     deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000),
  //     endTime: new Date(Date.now() + 10 * 24 * 3600 * 1000),
  //     options: '["Liverpool","Man City"]',
  //     odds: '[0,0]',
  //     description: 'Which team will be PL Winner',
  //     shortDescription: 'PL Winner Team',
  //   });
  // }

  @Command({
    command: 'receipt',
  })
  async receipt(): Promise<void> {
    const transactions = await this.transactionsService.findAll();
    for (const transaction of transactions.data)
      if (transaction.id >= 2057) {
        const receipt = await this.web3.eth.getTransactionReceipt(
          transaction.txId,
        );
        await this.transactionsService.update(transaction.id, {
          receipt: JSON.stringify(receipt),
          blockNumber: receipt?.blockNumber,
        });
      }
  }
}
