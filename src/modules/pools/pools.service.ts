import { Injectable } from '@nestjs/common';
import { CreatePoolDto } from './dto/create-pool.dto';
import { UpdatePoolDto } from './dto/update-pool.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoolEntity } from './entities/pool.entity';

@Injectable()
export class PoolsService {
  constructor(
    @InjectRepository(PoolEntity)
    private poolRepository: Repository<PoolEntity>,
  ) {}

  async create(createPoolDto: CreatePoolDto): Promise<PoolEntity> {
    return this.poolRepository.save(createPoolDto);
  }

  async findAll(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<PoolEntity[]>> {
    const qb = this.poolRepository
      .createQueryBuilder('pools')
      .leftJoinAndSelect('pools.event', 'event');

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

  async findOne(id: number): Promise<PoolEntity> {
    return this.poolRepository.findOne(id);
  }

  async findByEventToken(eventId: number, token: string): Promise<PoolEntity> {
    return this.poolRepository
      .createQueryBuilder('pools')
      .where('pools."eventId" = :eventId', { eventId })
      .andWhere('pools.token = :token', { token })
      .getOne();
  }

  async findByAffiliate(token: string): Promise<PoolEntity> {
    return this.poolRepository
      .createQueryBuilder('pools')
      .where('pools."affiliate" = :affiliate', { affiliate: true })
      .andWhere('pools.token = :token', { token })
      .getOne();
  }

  async totalAmount(eventId: number, token: string): Promise<number> {
    const qb = this.poolRepository
      .createQueryBuilder('pools')
      .where('pools.eventId = :eventId', { eventId })
      .andWhere('pools.token = :token', { token });
    qb.select(['SUM(COALESCE(pools.amount::numeric,0)) as "totalAmount"'])
      .groupBy('"eventId"')
      .addGroupBy('token');

    return (await qb.getRawOne())?.totalAmount || 0;
  }

  async update(id: number, updatePoolDto: UpdatePoolDto): Promise<PoolEntity> {
    await this.poolRepository.update(id, updatePoolDto);
    return this.poolRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.poolRepository.delete(id);
  }
}
