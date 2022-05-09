import { Injectable } from '@nestjs/common';
import { CreatePredictPoolDto } from './dto/create-predict-pool.dto';
import { UpdatePredictPoolDto } from './dto/update-predict-pool.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PredictPoolEntity } from './entities/predict-pool.entity';

@Injectable()
export class PredictPoolsService {
  constructor(
    @InjectRepository(PredictPoolEntity)
    private predictPoolRepository: Repository<PredictPoolEntity>,
  ) {}

  async create(
    createPredictPoolDto: CreatePredictPoolDto,
  ): Promise<PredictPoolEntity> {
    return this.predictPoolRepository.save(createPredictPoolDto);
  }

  async findAll(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<PredictPoolEntity[]>> {
    const qb = this.predictPoolRepository.createQueryBuilder('predictPools');

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

  async findOne(id: number): Promise<PredictPoolEntity> {
    return this.predictPoolRepository.findOne(id);
  }

  async update(
    id: number,
    updatePredictPoolDto: UpdatePredictPoolDto,
  ): Promise<PredictPoolEntity> {
    await this.predictPoolRepository.update(id, updatePredictPoolDto);
    return this.predictPoolRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.predictPoolRepository.delete(id);
  }
}
