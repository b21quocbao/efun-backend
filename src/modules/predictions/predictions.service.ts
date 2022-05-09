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
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<PredictionEntity[]>> {
    const qb = this.predictionRepository.createQueryBuilder('predictions');

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

  async findOne(id: number): Promise<PredictionEntity> {
    return this.predictionRepository.findOne(id);
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
