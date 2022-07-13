// eslint-disable-next-line
const Web3 = require('web3');
import { Injectable } from '@nestjs/common';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PredictionEntity } from './entities/prediction.entity';
import { SearchPredictionDto } from './dto/search-prediction.dto';
import { PSortEvent } from './enums/prediction-type.enum';
import { isNumber } from 'class-validator';
import { PoolsService } from '../pools/pools.service';
import BigNumber from 'bignumber.js';
import { EventStatus } from '../events/enums/event-status.enum';
import { predictionABI } from 'src/shares/contracts/abi/predictionABI';
BigNumber.config({ EXPONENTIAL_AT: 100 });

@Injectable()
export class PredictionsService {
  private web3;
  private predictionContract;

  constructor(
    @InjectRepository(PredictionEntity)
    private predictionRepository: Repository<PredictionEntity>,
    private readonly poolsService: PoolsService,
  ) {
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));
    this.predictionContract = new this.web3.eth.Contract(
      predictionABI,
      process.env.PREDICTION_PROXY,
    );
  }

  async create(
    createPredictionDto: CreatePredictionDto,
  ): Promise<PredictionEntity> {
    return this.predictionRepository.save(createPredictionDto);
  }

  async findAll(
    { orderBy, eventId, userId, predictionId }: SearchPredictionDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<PredictionEntity[]>> {
    const qb = this.predictionRepository
      .createQueryBuilder('predictions')
      .leftJoin('predictions.event', 'event')
      .leftJoin('predictions.transaction', 'transaction')
      .leftJoin('predictions.user', 'predictUser')
      .leftJoin('event.user', 'user')
      .leftJoin('event.category', 'category')
      .leftJoin('event.subCategory', 'subCategory')
      .select([
        'predictions.*',
        'event.id as "eventId"',
        'event.name as name',
        'event.endTime as "endTime"',
        'event.odds as odds',
        'event.options as options',
        'event.type as type',
        'event.marketType as "marketType"',
        'event.metadata as metadata',
        'event.status as "eventStatus"',
        'event.finalTime as "eventFinalTime"',
        'event.claimTime as "eventClaimTime"',
        'event.isBlock as "eventIsBlock"',
        'event.result as "eventResult"',
        'event.options as "eventOptions"',
        'category.name as category',
        '"subCategory".name as "subCategory"',
        'user.isVerified as "isUserVerified"',
        'user.address as address',
        '"predictUser".address as "userAddress"',
        'transaction."txId" as "transactionNumber"',
        'transaction."blockNumber" as "blockNumber"',
      ]);
    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }
    if (orderBy == PSortEvent.LATEST) {
      qb.orderBy('"createdAt"', 'DESC');
    }
    if (eventId) {
      qb.andWhere('predictions."eventId" = :eventId', { eventId });
    }
    if (userId) {
      qb.andWhere('predictions."userId" = :userId', { userId });
    }
    if (predictionId) {
      qb.andWhere('predictions."id" = :predictionId', { predictionId });
    }

    const [rs, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);
    return {
      data: await Promise.all(
        rs.map(async (prediction) => {
          let status = !prediction.eventResult
            ? 'Predicted'
            : isNumber(prediction.rewardTransactionId)
            ? 'Claimed'
            : 'Unknown';

          if (
            new Date(prediction.endTime).getTime() + 172800 * 1000 <
              Date.now() &&
            prediction.eventStatus != EventStatus.FINISH
          ) {
            status = prediction.cashBackTransactionId
              ? 'Claimed Cashback'
              : 'Claim Cashback';
          }

          let estimateReward = await this.predictionContract.methods
            .estimateReward(
              prediction.eventId,
              prediction.userAddress,
              prediction.token,
              prediction.predictNum,
              false,
            )
            .call()
            .catch(() => '0');
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

          return {
            ...prediction,
            status: status,
            estimateReward: estimateReward,
            sponsor: sponsor,
          };
        }),
      ),
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(userId: number, id: number): Promise<PredictionEntity> {
    return this.predictionRepository
      .createQueryBuilder('predictions')
      .leftJoin('predictions.event', 'event')
      .leftJoin('predictions.transaction', 'transaction')
      .leftJoin('event.user', 'user')
      .leftJoin('event.category', 'category')
      .leftJoin('event.subCategory', 'subCategory')
      .select([
        'predictions.*',
        'event.name as name',
        'event.odds as odds',
        'event.options as options',
        'event.type as type',
        'event.marketType as marketType',
        'event.metadata as metadata',
        'event.status as "eventStatus"',
        'category.name as category',
        '"subCategory".name as "subCategory"',
        'user.isVerified as "isUserVerified"',
        'user.address as address',
        'transaction."txId" as "transactionNumber"',
      ])
      .where('predictions.id = :id', { id })
      .andWhere('predictions."userId" = :userId', { userId })
      .getRawOne();
  }

  async totalAmount(
    eventId: number,
    token: string,
    optionIndex?: number,
  ): Promise<number> {
    const qb = this.predictionRepository
      .createQueryBuilder('predictions')
      .where('predictions.eventId = :eventId', { eventId })
      .andWhere('predictions.token = :token', { token });
    if (optionIndex || optionIndex == 0) {
      qb.andWhere('predictions.optionIndex = :optionIndex', { optionIndex });
    }
    qb.select(['SUM(COALESCE(predictions.amount::numeric,0)) as "totalAmount"'])
      .groupBy('"eventId"')
      .addGroupBy('token');
    if (optionIndex || optionIndex == 0) {
      qb.addGroupBy('"optionIndex"');
    }
    return (await qb.getRawOne())?.totalAmount || 0;
  }

  async findByPredictNum(
    predictNum: number,
    userId: number,
    token: string,
    eventId: number,
  ): Promise<PredictionEntity> {
    return this.predictionRepository
      .createQueryBuilder('predictions')
      .where('predictions."predictNum" = :predictNum', { predictNum })
      .andWhere('predictions."userId" = :userId', { userId })
      .andWhere('predictions."token" = :token', { token })
      .andWhere('predictions."eventId" = :eventId', { eventId })
      .getOne();
  }

  async update(
    id: number,
    updatePredictionDto: UpdatePredictionDto,
  ): Promise<PredictionEntity> {
    await this.predictionRepository.update(id, updatePredictionDto);
    return this.predictionRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.predictionRepository.delete(id);
  }
}
