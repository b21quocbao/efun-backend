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
import { EventType } from '../events/enums/event-type.enum';
import { PoolsService } from '../pools/pools.service';
import BigNumber from 'bignumber.js';
import { EventStatus } from '../events/enums/event-status.enum';
BigNumber.config({ EXPONENTIAL_AT: 100 });

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(PredictionEntity)
    private predictionRepository: Repository<PredictionEntity>,
    private readonly poolsService: PoolsService,
  ) {}

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
        'event.result as "eventResult"',
        'event.options as "eventOptions"',
        'category.name as category',
        '"subCategory".name as "subCategory"',
        'user.isVerified as "isUserVerified"',
        'user.address as address',
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
            : prediction.eventResult ==
              JSON.parse(prediction.eventOptions)[prediction.optionIndex]
            ? 'Claim'
            : 'Lost';
          if (
            new Date(prediction.endTime).getTime() >
              Date.now() + 2 * 86400 * 1000 &&
            prediction.eventStatus != EventStatus.FINISH
          ) {
            status = prediction.cashBackTransactionId
              ? 'Claimed Cashback'
              : 'Claim Cashback';
          }
          let estimateReward = '0';
          if (prediction.type === EventType.GroupPredict) {
            const lp = await this.poolsService.totalAmount(
              prediction.eventId,
              prediction.token,
            );
            const predictStats = await this.totalAmount(
              prediction.eventId,
              prediction.token,
            );
            const predictOptionStats = await this.totalAmount(
              prediction.eventId,
              prediction.token,
              prediction.optionIndex,
            );

            estimateReward = new BigNumber(predictStats)
              .plus(lp)
              .multipliedBy(prediction.amount)
              .dividedBy(predictOptionStats)
              .toString();
          } else {
            estimateReward = new BigNumber(prediction.amount)
              .multipliedBy(
                JSON.parse(prediction.odds)[prediction.optionIndex] / 10000,
              )
              .toString();
          }

          return {
            ...prediction,
            status: status,
            estimateReward: estimateReward,
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
