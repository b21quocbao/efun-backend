import { Injectable } from '@nestjs/common';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticEntity } from './entities/analytic.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CountNewWalletDto } from './dto/count-new-wallet.dto';
import { CountNewEventDto } from './dto/count-new-event.dto';
import { plainToClass } from 'class-transformer';
import { EventEntity } from '../events/entities/event.entity';
import { PredictionEntity } from '../predictions/entities/prediction.entity';
import { CountNewPredictionDto } from './dto/count-new-prediction.dto';
import BigNumber from 'bignumber.js';
import { DashboardIncomeDto } from './dto/dashboard-income.dto';
BigNumber.config({ EXPONENTIAL_AT: 100 });

function checkNaN(s: string): string {
  return s.toLowerCase() === 'nan' ? '0' : s;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticEntity)
    private analyticRepository: Repository<AnalyticEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(PredictionEntity)
    private predictionRepository: Repository<PredictionEntity>,
  ) {}

  async updateCount(): Promise<void> {
    const dateNow = new Date();
    const y = dateNow.getFullYear();
    const m = dateNow.getMonth() + 1;
    const d = dateNow.getDate();

    const entity = await this.analyticRepository.findOne({
      date: `${y}-${m}-${d}`,
    });
    if (!entity) {
      await this.analyticRepository.insert({
        date: `${y}-${m}-${d}`,
        count: 0,
      });
    }

    await this.analyticRepository.increment(
      { date: `${y}-${m}-${d}` },
      'count',
      1,
    );
  }

  async countNewWallet(countNewWalletDto: CountNewWalletDto): Promise<number> {
    const { startTime, endTime } = plainToClass(
      CountNewWalletDto,
      countNewWalletDto,
    );
    return this.userRepository
      .createQueryBuilder('users')
      .where(
        'users."createdAt" >= :startTime AND users."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .getCount();
  }

  async countNewEvent(countNewEventDto: CountNewEventDto): Promise<any[]> {
    const { startTime, endTime, token } = plainToClass(
      CountNewEventDto,
      countNewEventDto,
    );
    const qb = this.eventRepository
      .createQueryBuilder('events')
      .select('COUNT(*) AS cnt')
      .addSelect('events."playType"')
      .where(
        'events."createdAt" >= :startTime AND events."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      );
    if (token) {
      qb.andWhere(':token = ANY(events.tokens)', { token });
    }
    return qb.groupBy('events."playType"').getRawMany();
  }

  async countNewPrediction(
    countNewPredictionDto: CountNewPredictionDto,
  ): Promise<any[]> {
    const { startTime, endTime, token } = plainToClass(
      CountNewPredictionDto,
      countNewPredictionDto,
    );
    const qb = this.predictionRepository
      .createQueryBuilder('predictions')
      .select('COUNT(*) AS cnt')
      .leftJoin('predictions.event', 'event')
      .addSelect('event."playType"')
      .where(
        'predictions."createdAt" >= :startTime AND predictions."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      );
    if (token) {
      qb.andWhere('predictions.token = :token', { token });
    }
    return qb.groupBy('event."playType"').getRawMany();
  }

  async countNewUserEvent(countNewEventDto: CountNewEventDto): Promise<any[]> {
    const { startTime, endTime, token, playType } = plainToClass(
      CountNewEventDto,
      countNewEventDto,
    );
    const qb = this.userRepository
      .createQueryBuilder('users')
      .select('COUNT(DISTINCT users.id) AS cnt')
      .leftJoin('users.events', 'events')
      .where(
        'events."createdAt" >= :startTime AND events."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      );
    if (token) {
      qb.andWhere(':token = ANY(events.tokens)', { token });
    }
    if (playType) {
      qb.andWhere('events."playType" = :playType', { playType });
    }
    return qb.getRawMany();
  }

  async countNewUserPrediction(
    countNewPredictionDto: CountNewPredictionDto,
  ): Promise<any[]> {
    const { startTime, endTime, token, playType } = plainToClass(
      CountNewPredictionDto,
      countNewPredictionDto,
    );
    const qb = this.userRepository
      .createQueryBuilder('users')
      .select('COUNT(DISTINCT users.id) AS cnt')
      .leftJoin('users.predictions', 'predictions')
      .leftJoin('predictions.event', 'event')
      .where(
        'predictions."createdAt" >= :startTime AND predictions."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      );
    if (token) {
      qb.andWhere('predictions.token = :token', { token });
    }
    if (playType) {
      qb.andWhere('event."playType" = :playType', { playType });
    }
    return qb.getRawMany();
  }

  async dashboardPredictions(
    countNewPredictionDto: CountNewPredictionDto,
  ): Promise<any> {
    const { startTime, endTime, token, playType } = plainToClass(
      CountNewPredictionDto,
      countNewPredictionDto,
    );
    const metric1 = this.predictionRepository
      .createQueryBuilder('predictions')
      .select('COUNT(*)', 'cnt')
      .addSelect('LEAST(event.pro, 1)', 'pro')
      .leftJoin('predictions.event', 'event')
      .where(
        'predictions."createdAt" >= :startTime AND predictions."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere('event."playType" = :playType', { playType })
      .groupBy('LEAST(event.pro, 1)');

    const metric2_1 = this.predictionRepository
      .createQueryBuilder('predictions')
      .select('COUNT(DISTINCT predictions.id)', 'totalPredictions')
      .addSelect('COUNT(DISTINCT predictions."userId")', 'totalPredictors')
      .leftJoin('predictions.event', 'event')
      .where(
        'predictions."createdAt" >= :startTime AND predictions."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere('event."playType" = :playType', { playType });

    const metric2_2 = this.predictionRepository
      .createQueryBuilder('predictions')
      .select('SUM(predictions.amount::numeric)', 'totalPredictedPool')
      .addSelect('LEAST(event.pro, 1)', 'pro')
      .leftJoin('predictions.event', 'event')
      .where(
        'predictions."createdAt" >= :startTime AND predictions."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere('event."playType" = :playType', { playType })
      .groupBy('LEAST(event.pro, 1)');

    const metric2_3 = this.predictionRepository
      .createQueryBuilder('predictions')
      .select('predictions."userId"', 'userId')
      .addSelect('SUM(predictions.amount::numeric)', 'totalPredictedPool')
      .leftJoin('predictions.event', 'event')
      .where(
        'predictions."createdAt" >= :startTime AND predictions."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere('event."playType" = :playType', { playType })
      .groupBy('predictions."userId"');

    const metric2_4 = this.eventRepository
      .createQueryBuilder('events')
      .leftJoin('events.predictions', 'predictions')
      .select('events.id', 'eventId')
      .addSelect('COUNT(DISTINCT predictions.id)', 'totalPredictions')
      .addSelect('SUM(predictions.amount::numeric)', 'totalPredictedPool')
      .where('predictions."createdAt" < :endTime', {
        endTime: endTime,
      })
      .andWhere(
        'events."createdAt" >= :startTime AND events."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere(`events."playType" = :playType`, { playType })
      .groupBy('events.id');

    const metric3 = this.predictionRepository
      .createQueryBuilder('predictions')
      .select('category.name', 'category')
      .addSelect('LEAST(event.pro, 1)', 'pro')
      .addSelect('COUNT(DISTINCT predictions.id)', 'totalPredictions')
      .leftJoin('predictions.event', 'event')
      .leftJoin('event.category', 'category')
      .where(
        'predictions."createdAt" >= :startTime AND predictions."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere('event."playType" = :playType', { playType })
      .groupBy('category.id')
      .addGroupBy('LEAST(event.pro, 1)');

    if (token) {
      metric1.andWhere('predictions.token = :token', { token });
      metric2_1.andWhere('predictions.token = :token', { token });
      metric2_2.andWhere('predictions.token = :token', { token });
      metric2_3.andWhere('predictions.token = :token', { token });
      metric2_4.andWhere('predictions.token = :token', { token });
      metric3.andWhere('predictions.token = :token', { token });
    }

    const metric1Res = await metric1.getRawMany();
    const metric2_1Res = await metric2_1.getRawMany();
    const metric2_2Res = await metric2_2.getRawMany();
    const metric2_3Res = await metric2_3.getRawMany();
    const metric2_4Res = await metric2_4.getRawMany();
    const metric3Res = await metric3.getRawMany();

    return {
      metric1Res: metric1Res,
      metric2Res: {
        totalPredictions: metric2_1Res[0].totalPredictions,
        totalPredictors: metric2_1Res[0].totalPredictors,
        totalVolume: metric2_2Res,
        avgPredictPerUser: checkNaN(
          metric2_3Res
            .reduce(
              (sum, a) => new BigNumber(sum).plus(a.totalPredictedPool),
              new BigNumber(0),
            )
            .div(metric2_3Res.length)
            .toString(),
        ),
        avgPredictAmount: checkNaN(
          metric2_4Res
            .reduce(
              (sum, a) => new BigNumber(sum).plus(a.totalPredictedPool || 0),
              new BigNumber(0),
            )
            .div(metric2_4Res.length)
            .toString(),
        ),
        avgPredictNum: checkNaN(
          metric2_4Res
            .reduce(
              (sum, a) => new BigNumber(sum).plus(a.totalPredictions),
              new BigNumber(0),
            )
            .div(metric2_4Res.length)
            .toString(),
        ),
      },
      metric3Res,
    };
  }

  async dashboardEvents(countNewEventDto: CountNewEventDto): Promise<any> {
    const { startTime, endTime, token, playType } = plainToClass(
      CountNewEventDto,
      countNewEventDto,
    );
    const metric1 = this.eventRepository
      .createQueryBuilder('events')
      .select('COUNT(*)', 'cnt')
      .addSelect('LEAST(events.pro, 1)', 'pro')
      .where(
        'events."createdAt" >= :startTime AND events."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere(`events."playType" = :playType`, { playType })
      .groupBy('LEAST(events.pro, 1)');

    const metric2_1 = this.eventRepository
      .createQueryBuilder('events')
      .select('COUNT(DISTINCT events.id)', 'totalEvents')
      .addSelect('COUNT(DISTINCT events."userId")', 'totalHosts')
      .where(
        'events."createdAt" >= :startTime AND events."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere(`events."playType" = :playType`, { playType });

    const metric2_2 = this.eventRepository
      .createQueryBuilder('events')
      .leftJoin('events.pools', 'pools')
      .select('events.id', 'eventId')
      .addSelect('SUM(pools.amount::numeric)', 'totalPool')
      .where(
        'events."createdAt" >= :startTime AND events."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere(`events."playType" = :playType`, { playType })
      .groupBy('events.id');

    const metric3 = this.eventRepository
      .createQueryBuilder('events')
      .select('category.name', 'category')
      .addSelect('LEAST(events.pro, 1)', 'pro')
      .addSelect('COUNT(DISTINCT events.id)', 'totalEvents')
      .leftJoin('events.category', 'category')
      .where(
        'events."createdAt" >= :startTime AND events."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere(`events."playType" = :playType`, { playType })
      .groupBy('category.id')
      .addGroupBy('LEAST(events.pro, 1)');

    if (token) {
      metric1.andWhere(':token = ANY(events.tokens)', { token });
      metric2_1.andWhere(':token = ANY(events.tokens)', { token });
      metric2_2.andWhere(':token = ANY(events.tokens)', { token });
      metric3.andWhere(':token = ANY(events.tokens)', { token });
    }

    const metric1Res = await metric1.getRawMany();
    const metric2_1Res = await metric2_1.getRawMany();
    const metric2_2Res = await metric2_2.getRawMany();
    const metric3Res = await metric3.getRawMany();

    return {
      metric1Res: metric1Res,
      metric2Res: {
        totalEvents: metric2_1Res[0].totalEvents,
        totalHosts: metric2_1Res[0].totalHosts,
        totalPoolAmount: metric2_2Res
          .reduce(
            (sum, a) => new BigNumber(sum).plus(a.totalPool || 0),
            new BigNumber(0),
          )
          .toString(),
        avgPoolAmount: checkNaN(
          metric2_2Res
            .reduce(
              (sum, a) => new BigNumber(sum).plus(a.totalPool || 0),
              new BigNumber(0),
            )
            .div(metric2_2Res.length)
            .toString(),
        ),
      },
      metric3Res,
    };
  }

  async dashboardIncome(dashboardIncomeDto: DashboardIncomeDto): Promise<any> {
    const { startTime, endTime, token } = plainToClass(
      DashboardIncomeDto,
      dashboardIncomeDto,
    );

    const eventCount = await this.eventRepository
      .createQueryBuilder('events')
      .addSelect('events."playType"')
      .where(
        'events."createdAt" >= :startTime AND events."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere(':token = ANY(events.tokens)', { token })
      .getCount();

    const uvuTotalAmount = await this.predictionRepository
      .createQueryBuilder('predictions')
      .leftJoin('predictions.event', 'event')
      .select('SUM(predictions."amount"::numeric)', 'total')
      .where(
        'event."claimTime" >= :startTime AND event."claimTime" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere('predictions."optionIndex" != event."resultIndex"')
      .andWhere('event."isBlock" = false')
      .andWhere('predictions."amount" IS NOT NULL')
      .andWhere(`event."playType" = 'user vs user'`)
      .andWhere(`predictions.token = :token`, { token })
      .getRawOne();

    const uvpTotalAmount = await this.predictionRepository
      .createQueryBuilder('predictions')
      .leftJoin('predictions.event', 'event')
      .select('SUM(predictions.amount::numeric)', 'total')
      .where(
        'event."claimTime" >= :startTime AND event."claimTime" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      )
      .andWhere('event."isBlock" = false')
      .andWhere('predictions."amount" IS NOT NULL')
      .andWhere(`event."playType" = 'user vs pool'`)
      .andWhere(`predictions.token = :token`, { token })
      .getRawOne();

    return {
      eventCreateFee: eventCount * 10000,
      uvuTotalAmount: new BigNumber(uvuTotalAmount.total)
        .multipliedBy(1)
        .dividedBy(100)
        .toString(),
      uvpTotalAmount: new BigNumber(uvpTotalAmount.total)
        .multipliedBy(0.5)
        .dividedBy(100)
        .toString(),
    };
  }

  async findAll(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<AnalyticEntity[]>> {
    const qb = this.analyticRepository.createQueryBuilder('analytics');

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<AnalyticEntity> {
    return this.analyticRepository.findOne(id);
  }

  async findOneByDate(date: string): Promise<AnalyticEntity> {
    return this.analyticRepository.findOne({ where: { date } });
  }
}
