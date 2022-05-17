import { Controller, Get, Param } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { RewardEntity } from './entities/reward.entity';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  async findAll(): Promise<Response<RewardEntity[]>> {
    return this.rewardsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RewardEntity> {
    return this.rewardsService.findOne(+id);
  }
}
