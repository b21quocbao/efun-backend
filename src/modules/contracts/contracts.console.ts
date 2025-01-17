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
import BigNumber from 'bignumber.js';
import { isNumber } from 'class-validator';
import { ElpsService } from '../elps/elps.service';
import { NftsService } from '../nfts/nfts.service';
const { toWei } = Web3.utils;

@Injectable()
export class ContractConsole implements OnModuleInit {
  private web3;
  private web3_2;
  private predictionContract;
  private eventContract;
  private recalPoolAmount;
  private recalPredictionAmount;
  private recalEstimateReward;
  private eventHandler1;
  private eventHandler2;
  private eventHandler3;
  private eventHandler4;
  private eventHandler5;
  private eventHandler6;
  private eventHandler7;
  private eventHandler8;
  private eventHandler9;

  constructor(
    private readonly eventsService: EventsService,
    private readonly predictionsService: PredictionsService,
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
    private readonly latestBlockService: LatestBlockService,
    private readonly poolsService: PoolsService,
    private readonly elpsService: ElpsService,
    private readonly nftsService: NftsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.web3 = new Web3(process.env.RPC_URL);
    if (process.env.RPC_URL_2 && process.env.RPC_URL_2.length > 0) {
      this.web3_2 = new Web3(process.env.RPC_URL_2);
    }

    this.recalEstimateReward = async (recalEstimateRewardDto: {
      predictionId?: number;
      eventId?: number;
    }) => {
      console.log('recalEstimateReward', 'Line #55 contracts.console.ts');

      const { predictionId, eventId } = recalEstimateRewardDto;
      let predictions;
      if (predictionId) {
        predictions = await this.predictionsService.findAll({
          predictionId,
        });
      } else {
        predictions = await this.predictionsService.findAll({
          eventId,
        });
      }

      for (const prediction of predictions.data) {
        let status = !prediction.eventResult
          ? 'Predicted'
          : isNumber(prediction.rewardTransactionId)
          ? 'Claimed'
          : 'Unknown';

        let estimateReward = '';
        if (status == 'Unknown') {
          status = 'Claim';
          try {
            estimateReward = await this.predictionContract.methods
              .estimateReward(
                prediction.eventId,
                prediction.userAddress,
                prediction.token,
                prediction.predictNum,
                true,
              )
              .call();
          } catch (err) {
            status = 'Lost';
          }
        } else if (status == 'Claimed') {
          estimateReward = prediction.rewardAmount;
        } else {
          estimateReward = await this.predictionContract.methods
            .estimateReward(
              prediction.eventId,
              prediction.userAddress,
              prediction.token,
              prediction.predictNum,
              false,
            )
            .call()
            .catch(() => '0');
        }
        let sponsor = await this.predictionContract.methods
          .estimateRewardSponsor(
            prediction.eventId,
            prediction.userAddress,
            prediction.token,
            prediction.predictNum,
          )
          .call()
          .catch(() => '0');
        if (status === 'Lost') {
          sponsor = '0';
        }
        const resultIndex = JSON.parse(prediction.eventOptions).indexOf(
          prediction.eventResult,
        );

        if (
          resultIndex == 2 ||
          (resultIndex == 3 && prediction.optionIndex == 0) ||
          (resultIndex == 1 && prediction.optionIndex == 4)
        ) {
          sponsor = '0';
        }

        await this.predictionsService.update(prediction.id, {
          status: status,
          estimateReward: estimateReward,
          sponsor: sponsor,
        });
      }
    };

    this.recalPoolAmount = async (eventId: number) => {
      console.log('recalPoolAmount', 'Line #55 contracts.console.ts');

      const events = await this.eventsService.findAll({ eventId });
      const event = events.data[0];
      console.log(
        event.poolTokens.map((x: any) => x.token).filter((x) => !!x),
        'Line #153 contracts.console.ts',
      );

      const poolEstimateClaimAmounts = await this.predictionContract.methods
        .getRemainingLP(
          event.id,
          event.poolTokens.map((x: any) => x.token).filter((x) => !!x),
        )
        .call()
        .catch(() => '0');
      const poolTokenAmounts = {};
      const poolTokenClaimAmounts = {};
      const poolTokenEstimateClaimAmounts = {};

      for (let idx = 0; idx < event.poolTokens.length; ++idx) {
        poolTokenAmounts[event.poolTokens[idx].token] =
          event.poolTokens[idx].amount;
        poolTokenClaimAmounts[event.poolTokens[idx].token] =
          event.poolTokens[idx].claimAmount;
        poolTokenEstimateClaimAmounts[event.poolTokens[idx].token] =
          poolEstimateClaimAmounts[idx];
      }

      await this.eventsService.update(eventId, {
        poolTokenAmounts,
        poolTokenClaimAmounts,
        poolTokenEstimateClaimAmounts,
      });
    };

    this.recalPredictionAmount = async (eventId: number) => {
      console.log('recalPredictionAmount', 'Line #55 contracts.console.ts');

      const events = await this.eventsService.findAll({ eventId });
      const event = events.data[0];

      const predictionTokenAmounts = {};
      const predictionTokenOptionAmounts = {};

      const predictions = await this.predictionsService.findAll({
        eventId: event.id,
      });

      for (const prediction of predictions.data) {
        if (!predictionTokenAmounts[prediction.token]) {
          predictionTokenAmounts[prediction.token] = '0';
        }
        predictionTokenAmounts[prediction.token] = new BigNumber(
          predictionTokenAmounts[prediction.token],
        )
          .plus(prediction.amount)
          .toString();

        if (!predictionTokenOptionAmounts[prediction.token]) {
          predictionTokenOptionAmounts[prediction.token] = {};
        }
        if (
          !predictionTokenOptionAmounts[prediction.token][
            prediction.optionIndex
          ]
        ) {
          predictionTokenOptionAmounts[prediction.token][
            prediction.optionIndex
          ] = new BigNumber(0);
        }
        predictionTokenOptionAmounts[prediction.token][prediction.optionIndex] =
          predictionTokenOptionAmounts[prediction.token][
            prediction.optionIndex
          ].plus(prediction.amount);
      }
      for (const token of Object.keys(predictionTokenOptionAmounts)) {
        let sum = new BigNumber(0);
        for (const index of Object.keys(predictionTokenOptionAmounts[token])) {
          sum = sum.plus(predictionTokenOptionAmounts[token][index]);
        }
        for (const index of Object.keys(predictionTokenOptionAmounts[token])) {
          predictionTokenOptionAmounts[token][index] = Math.trunc(
            predictionTokenOptionAmounts[token][index].div(sum).toNumber() *
              100,
          );
        }
      }

      await this.eventsService.update(eventId, {
        predictionTokenAmounts,
        predictionTokenOptionAmounts,
      });
    };

    this.eventHandler1 = async (event): Promise<void> => {
      try {
        console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
        console.log(`Handle item with id ${event.returnValues.idx}`);

        const user = await this.usersService.findByAddress(
          event.returnValues.addresses[2],
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

          let odds = JSON.stringify(event.returnValues.odds);
          let tokenOptions = '[]';

          if (
            event.returnValues.numInfos[3] == 5 ||
            event.returnValues.numInfos[3] == 6
          ) {
            odds = JSON.stringify(
              event.returnValues.odds.slice(
                0,
                event.returnValues.odds.length / 2,
              ),
            );
            tokenOptions = JSON.stringify(
              event.returnValues.odds.slice(
                0,
                event.returnValues.odds.length / 2,
              ),
            );
          }

          const { data: result } = await axios.get(event.returnValues.datas);

          await this.eventsService.create(user.id, {
            id: event.returnValues.idx,
            startTime: new Date(event.returnValues.numInfos[0] * 1000),
            deadline: new Date(event.returnValues.numInfos[1] * 1000),
            endTime: new Date(event.returnValues.numInfos[2] * 1000),
            odds: odds,
            transactionId: transactionEntity.id,
            options: result.options,
            tokenOptions: tokenOptions,
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
            pro: event.returnValues.numInfos[3],
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
            coinId:
              result.coinId && result.coinId.length
                ? Number(result.coinId)
                : undefined,
            type: result.type,
            marketType: result.marketType.length
              ? result.marketType
              : undefined,
            description: result.description,
            creationFee: event.returnValues.creationFee || toWei('10000'),
            playType: JSON.parse(result.metadata).eventType,
            tokens: JSON.parse(result.metadata).tokens,
            metadata: result.metadata,
            affiliate: event.returnValues.affiliate,
            hostFee: event.returnValues.numInfos[4],
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

      const eventEntity = await this.eventsService.findOne(
        event.returnValues.eventId,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );
      let transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );

      if (eventEntity) {
        if (eventEntity.pro && eventEntity.pro != 5) {
          event.returnValues.index -= 1;
        }

        if (eventEntity.pro == 5) {
          await this.eventsService.update(eventEntity.id, {
            finalResult: await this.eventContract.methods
              .finalResult(eventEntity.id)
              .call(),
          });
        }

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

        if (event.returnValues.index == -1) {
          await this.eventsService.update(eventEntity.id, {
            finalTime: new Date(event.returnValues.finalTime * 1000),
            claimTime: new Date(event.returnValues.claimTime * 1000),
            updateResultTransactionId: transactionEntity.id,
            isBlock: true,
          });
        } else {
          await this.eventsService.update(eventEntity.id, {
            result: JSON.parse(eventEntity.options)[event.returnValues.index],
            resultIndex: event.returnValues.index,
            finalTime: new Date(event.returnValues.finalTime * 1000),
            claimTime: new Date(event.returnValues.claimTime * 1000),
            updateResultTransactionId: transactionEntity.id,
            status: EventStatus.FINISH,
          });

          await this.recalEstimateReward({ eventId: eventEntity.id });
          await this.recalPoolAmount(event.returnValues.eventId);
        }
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

        const prediction = await this.predictionsService.create({
          eventId: event.returnValues.eventId,
          userId: user.id,
          predictNum: event.returnValues.predictNum,
          transactionId: transaction.id,
          optionIndex: event.returnValues.optionIndex,
          token: event.returnValues.token,
          amount: event.returnValues.amount,
        });

        await this.recalEstimateReward({ predictionId: prediction.id });
        await this.recalPredictionAmount(prediction.eventId);
        await this.recalPoolAmount(event.returnValues.eventId);
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

        await this.recalEstimateReward({ predictionId: prediction.id });
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
          await this.recalPoolAmount(event.returnValues.eventId);
        } else {
          await this.poolsService.create({
            eventId: event.returnValues.eventId,
            transactionId: transactionEntity.id,
            token: event.returnValues.token,
            amount: event.returnValues.amount,
          });
          await this.recalPoolAmount(event.returnValues.eventId);
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
        await this.recalPoolAmount(event.returnValues.eventId);
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

    this.eventHandler8 = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      const user = await this.usersService.findByAddress(
        event.returnValues.user,
      );
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );
      const transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );

      if (user && !transactionEntity) {
        const transaction = await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          receipt: JSON.stringify(receipt),
          blockNumber: receipt?.blockNumber,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        if (event.returnValues.nftIds.length > 0) {
          if (event.returnValues.isBuy) {
            let classId = event.returnValues.classId;
            for (const nftId of event.returnValues.nftIds) {
              await this.nftsService.create({
                id: nftId,
                userId: user.id,
                buyTransactionId: transaction.id,
                buyNav: event.returnValues.nav,
                classId: classId,
                buyAmount: new BigNumber(event.returnValues.amount)
                  .div(event.returnValues.nftIds.length)
                  .toString(),
                buyFee: event.returnValues.fee || 0,
                buyTimestamp: event.returnValues.timestamp,
              });
              ++classId;
            }
          } else {
            for (const nftId of event.returnValues.nftIds) {
              await this.nftsService.update(nftId, {
                cashBackTransactionId: transaction.id,
                cashBackNav: event.returnValues.nav,
                cashBackAmount: event.returnValues.amount,
                cashBackFee: event.returnValues.fee || 0,
                cashBackTimestamp: event.returnValues.timestamp,
              });
            }
          }
        } else {
          await this.elpsService.create({
            transactionId: transaction.id,
            userId: user.id,
            nav: event.returnValues.nav,
            amount: event.returnValues.amount,
            timestamp: event.returnValues.timestamp,
            fee: event.returnValues.fee || 0,
            buy: event.returnValues.isBuy,
          });
        }
      }
    };

    this.eventHandler9 = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      const user = await this.usersService.findByAddress(event.returnValues.to);
      const receipt = await this.web3.eth.getTransactionReceipt(
        event.transactionHash,
      );
      const transactionEntity = await this.transactionsService.findOneByHash(
        event.transactionHash,
      );
      const nft = await this.nftsService.findOne(event.returnValues.tokenId);

      if (user && nft && !transactionEntity) {
        await this.transactionsService.create({
          contractAddress: event.address,
          gas: receipt?.gasUsed,
          receipt: JSON.stringify(receipt),
          blockNumber: receipt?.blockNumber,
          walletAddress: receipt?.from,
          txId: event.transactionHash,
        });

        await this.nftsService.update(nft.id, {
          userId: user.id,
        });
      }
    };
  }

  onModuleInit() {
    const contractSchedule = async () => {
      while (true) {
        try {
          await crawlSmartcontractEventsBatch(
            this.web3,
            this.web3_2,
            this.latestBlockService,
            [1, 0, 1, 1, 1, 1, 1, 2, 3],
            [
              ContractEvent.EventCreated,
              ContractEvent.EventResultUpdated,
              ContractEvent.PredictionCreated,
              ContractEvent.RewardClaimed,
              ContractEvent.LPDeposited,
              ContractEvent.LPClaimed,
              ContractEvent.CashBackClaimed,
              ContractEvent.TokenAction,
              ContractEvent.Transfer,
            ],
            [
              this.eventHandler1,
              this.eventHandler2,
              this.eventHandler3,
              this.eventHandler4,
              this.eventHandler5,
              this.eventHandler6,
              this.eventHandler7,
              this.eventHandler8,
              this.eventHandler9,
            ],
          );
        } catch (err) {
          console.log(err);
        }
        await new Promise((resolve) =>
          setTimeout(resolve, Number(process.env.CRONT_CONTRACT) * 1000),
        );
      }
    };

    if (process.env.CRONT_CONTRACT && process.env.CRONT_CONTRACT.length > 0) {
      contractSchedule();
    }

    (async () => {
      const { predictionABI } = await import(
        `../../shares/contracts/abi/${process.env.APP_ENV}/predictionABI`
      );
      const { eventABI } = await import(
        `../../shares/contracts/abi/${process.env.APP_ENV}/eventABI`
      );

      this.predictionContract = new this.web3.eth.Contract(
        predictionABI,
        process.env.PREDICTION_PROXY,
      );
      this.eventContract = new this.web3.eth.Contract(
        eventABI,
        process.env.EVENT_PROXY,
      );
    })();
  }
}
