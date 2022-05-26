import { Injectable } from '@nestjs/common';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PredictionEntity } from './entities/prediction.entity';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(PredictionEntity)
    private predictionRepository: Repository<PredictionEntity>,
  ) {}

  async create(
    createPredictionDto: CreatePredictionDto,
  ): Promise<PredictionEntity> {
    return this.predictionRepository.save(createPredictionDto);
  }

  async findAll(
    userId: number,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<PredictionEntity[]>> {
    const qb = this.predictionRepository
      .createQueryBuilder('predictions')
      .leftJoin('predictions.event', 'event')
      .leftJoin('predictions.transaction', 'transaction')
      .leftJoin('event.user', 'user')
      .leftJoin('event.category', 'category')
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
        'user.isVerified as "isUserVerified"',
        'user.address as address',
        'transaction."txId" as "transactionNumber"',
      ])
      .where('predictions."userId" = :userId', { userId });

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    const [rs, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);
    return {
      data: rs,
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
        'user.isVerified as "isUserVerified"',
        'user.address as address',
        'transaction."txId" as "transactionNumber"',
      ])
      .where('predictions.id = :id', { id })
      .andWhere('predictions."userId" = :userId', { userId })
      .getRawOne();
  }

  async findByPredictNum(
    predictNum: number,
    userId: number,
  ): Promise<PredictionEntity> {
    return this.predictionRepository
      .createQueryBuilder('predictions')
      .where('predictions."predictNum" = :predictNum', { predictNum })
      .andWhere('predictions."userId" = :userId', { userId })
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
