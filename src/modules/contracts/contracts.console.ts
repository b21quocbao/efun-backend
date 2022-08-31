// eslint-disable-next-line
const Web3 = require('web3');
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ContractEvent } from 'src/shares/contracts/constant';
import { crawlSmartcontractEventsBatch } from 'src/shares/helpers/smartcontract';
import { LatestBlockService } from '../latest-block/latest-block.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { PredictionsService } from '../predictions/predictions.service';
import { EventStatus } from '../events/enums/event-status.enum';
import { PoolsService } from '../pools/pools.service';
import axios from 'axios';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class ContractConsole implements OnModuleInit {
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
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));

    this.eventHandler1 = async (event): Promise<void> => {
      try {
        console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
        console.log(`Handle item with id ${event.returnValues.idx}`);

        const user = await this.usersService.findByAddress(
          event.returnValues.creator,
        );
        const eventEntity = await this.eventsService.findOne(
          event.returnValues.idx,
        );
        const receipt = await this.web3.eth.getTransactionReceipt(
          event.transactionHash,
        );
        let transactionEntity = await this.transactionsService.findOneByHash(
          event.transactionHash,
        );

        if (user && !eventEntity) {
          if (!transactionEntity) {
            transactionEntity = await this.transactionsService.create({
              contractAddress: event.address,
              gas: receipt?.gasUsed,
              receipt: JSON.stringify(receipt),
              blockNumber: receipt?.blockNumber,
              walletAddress: receipt?.from,
              txId: event.transactionHash,
            });
          }
          const { data: result } = await axios.get(event.returnValues.datas);

          await this.eventsService.create(user.id, {
            id: event.returnValues.idx,
            startTime: new Date(event.returnValues.startTime * 1000),
            deadline: new Date(event.returnValues.deadlineTime * 1000),
            endTime: new Date(event.returnValues.endTime * 1000),
            odds: JSON.stringify(event.returnValues.odds),
            transactionId: transactionEntity.id,
            options: result.options,
            name: result.name,
            thumbnailUrl: result.thumbnailUrl.replace(
              'ipfs.infura.io',
              'cf-ipfs.com',
            ),
            bannerUrl: result.bannerUrl.length
              ? result.bannerUrl.replace('ipfs.infura.io', 'cf-ipfs.com')
              : undefined,
            categoryId: result.categoryId.length
              ? Number(result.categoryId)
              : undefined,
            pro: event.returnValues.pro,
            fixtureId:
              result.fixtureId && result.fixtureId.length
                ? Number(result.fixtureId)
                : undefined,
            subCategoryId: result.subCategoryId.length
              ? Number(result.subCategoryId)
              : undefined,
            competitionId: result.competitionId.length
              ? Number(result.competitionId)
              : undefined,
            leagueId:
              result.leagueId && result.leagueId.length
                ? Number(result.leagueId)
                : undefined,
            type: result.type,
            marketType: result.marketType.length
              ? result.marketType
              : undefined,
            description: result.description,
            metadata: result.metadata,
            affiliate: event.returnValues.affiliate,
            hostFee: event.returnValues._hostFee,
            shortDescription: result.shortDescription,
            streamUrl: result.streamUrl.length ? result.streamUrl : undefined,
          });
        }
      } catch (err) {
        console.error(err);
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
          finalTime: new Date(event.returnValues.finalTime * 1000),
          claimTime: new Date(event.returnValues.claimTime * 1000),
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
      let transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );
      const prediction = await this.predictionsService.findByPredictNum(
        event.returnValues.predictNum,
        user.id,
        event.returnValues.token,
        event.returnValues.eventId,
      );

      if (user && eventEntity && prediction) {
        if (!transactionEntity) {
          transactionEntity = await this.transactionsService.create({
            contractAddress: event.address,
            gas: receipt?.gasUsed,
            receipt: JSON.stringify(receipt),
            blockNumber: receipt?.blockNumber,
            walletAddress: receipt?.from,
            txId: event.transactionHash,
          });
        }

        await this.predictionsService.update(prediction.id, {
          rewardTransactionId: transactionEntity.id,
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
      let transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );

      if (event.returnValues.eventId == 0) {
        const pool = await this.poolsService.findByAffiliate(
          event.returnValues.token,
        );
        if (!transactionEntity) {
          transactionEntity = await this.transactionsService.create({
            contractAddress: event.address,
            gas: receipt?.gasUsed,
            receipt: JSON.stringify(receipt),
            blockNumber: receipt?.blockNumber,
            walletAddress: receipt?.from,
            txId: event.transactionHash,
          });
        }

        if (pool) {
          await this.poolsService.update(pool.id, {
            amount: event.returnValues.amount,
          });
        } else {
          await this.poolsService.create({
            affiliate: true,
            transactionId: transactionEntity.id,
            token: event.returnValues.token,
            amount: event.returnValues.amount,
          });
        }
        return;
      }

      const eventEntity = await this.eventsService.findOne(
        event.returnValues.eventId,
      );
      const pool = await this.poolsService.findByEventToken(
        event.returnValues.eventId,
        event.returnValues.token,
      );

      if (eventEntity) {
        if (!transactionEntity) {
          transactionEntity = await this.transactionsService.create({
            contractAddress: event.address,
            gas: receipt?.gasUsed,
            receipt: JSON.stringify(receipt),
            blockNumber: receipt?.blockNumber,
            walletAddress: receipt?.from,
            txId: event.transactionHash,
          });
        }

        if (pool) {
          await this.poolsService.update(pool.id, {
            amount: event.returnValues.amount,
          });
        } else {
          await this.poolsService.create({
            eventId: event.returnValues.eventId,
            transactionId: transactionEntity.id,
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
      let transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );
      const eventEntity = await this.eventsService.findOne(
        event.returnValues.eventId,
      );
      const pool = await this.poolsService.findByEventToken(
        event.returnValues.eventId,
        event.returnValues.token,
      );

      if (eventEntity && pool) {
        if (!transactionEntity) {
          transactionEntity = await this.transactionsService.create({
            contractAddress: event.address,
            gas: receipt?.gasUsed,
            receipt: JSON.stringify(receipt),
            blockNumber: receipt?.blockNumber,
            walletAddress: receipt?.from,
            txId: event.transactionHash,
          });
        }

        await this.poolsService.update(pool.id, {
          claimAmount: event.returnValues.amount,
          claimTransactionId: transactionEntity.id,
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

  onModuleInit() {
    const contractSchedule = async () => {
      try {
        await crawlSmartcontractEventsBatch(
          this.web3,
          this.latestBlockService,
          [false, true, false, false, false, false, false],
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
      } catch (err) {
        console.log(err);
      }
    };

    this.schedulerRegistry.addCronJob(
      'contractSchedule',
      new CronJob(process.env.CRONT_CONTRACT, contractSchedule),
    );
    this.schedulerRegistry.getCronJob('contractSchedule').start();
  }
}
