import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticEntity } from './entities/analytic.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EventEntity } from '../events/entities/event.entity';
import { PredictionEntity } from '../predictions/entities/prediction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalyticEntity]),
    TypeOrmModule.forFeature([EventEntity]),
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([PredictionEntity]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
