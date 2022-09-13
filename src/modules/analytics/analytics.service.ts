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
    const { startTime, endTime, token } = plainToClass(
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
    return qb.getRawMany();
  }

  async countNewUserPrediction(
    countNewEventDto: CountNewEventDto,
  ): Promise<any[]> {
    const { startTime, endTime, token } = plainToClass(
      CountNewEventDto,
      countNewEventDto,
    );
    const qb = this.userRepository
      .createQueryBuilder('users')
      .select('COUNT(DISTINCT users.id) AS cnt')
      .leftJoin('users.predictions', 'predictions')
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
    return qb.getRawMany();
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
