import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { PredictionEntity } from './entities/prediction.entity';
import { PoolsModule } from '../pools/pools.module';

@Module({
  imports: [TypeOrmModule.forFeature([PredictionEntity]), PoolsModule],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
