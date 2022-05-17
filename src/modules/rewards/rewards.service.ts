import { Injectable } from '@nestjs/common';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardEntity } from './entities/reward.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(RewardEntity)
    private rewardRepository: Repository<RewardEntity>,
  ) {}

  async create(createRewardDto: CreateRewardDto): Promise<RewardEntity> {
    return this.rewardRepository.save(createRewardDto);
  }

  async findAll(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<RewardEntity[]>> {
    const qb = this.rewardRepository.createQueryBuilder('rewards');

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

  async findOne(id: number): Promise<RewardEntity> {
    return this.rewardRepository.findOne(id);
  }

  async update(
    id: number,
    updateRewardDto: UpdateRewardDto,
  ): Promise<RewardEntity> {
    await this.rewardRepository.update(id, updateRewardDto);
    return this.rewardRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.rewardRepository.delete(id);
  }
}
