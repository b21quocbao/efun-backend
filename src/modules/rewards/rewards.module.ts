import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { RewardEntity } from './entities/reward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RewardEntity])],
  controllers: [RewardsController],
  providers: [RewardsService],
})
export class RewardsModule {}
