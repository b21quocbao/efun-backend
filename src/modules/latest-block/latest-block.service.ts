import { Injectable } from '@nestjs/common';
import { CreateLatestBlockDto } from './dto/create-latest-block.dto';
import { UpdateLatestBlockDto } from './dto/update-latest-block.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LatestBlockEntity } from './entities/latest-block.entity';

@Injectable()
export class LatestBlockService {
  constructor(
    @InjectRepository(LatestBlockEntity)
    private latestBlockRepository: Repository<LatestBlockEntity>,
  ) {}

  async create(
    createLatestBlockDto: CreateLatestBlockDto,
  ): Promise<LatestBlockEntity> {
    return this.latestBlockRepository.save(createLatestBlockDto);
  }

  async findAll(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<LatestBlockEntity[]>> {
    const qb = this.latestBlockRepository.createQueryBuilder('latestBlocks');

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

  async findOne(id: number): Promise<LatestBlockEntity> {
    return this.latestBlockRepository.findOne(id);
  }

  async update(
    id: number,
    updateLatestBlockDto: UpdateLatestBlockDto,
  ): Promise<LatestBlockEntity> {
    await this.latestBlockRepository.update(id, updateLatestBlockDto);
    return this.latestBlockRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.latestBlockRepository.delete(id);
  }
}
