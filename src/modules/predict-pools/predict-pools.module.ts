import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictPoolsService } from './predict-pools.service';
import { PredictPoolsController } from './predict-pools.controller';
import { PredictPoolEntity } from './entities/predict-pool.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PredictPoolEntity])],
  controllers: [PredictPoolsController],
  providers: [PredictPoolsService],
})
export class PredictPoolsModule {}
