import { Injectable } from '@nestjs/common';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticEntity } from './entities/analytic.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CountNewWalletDto } from './dto/count-new-wallet.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticEntity)
    private analyticRepository: Repository<AnalyticEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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
