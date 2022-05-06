import { Module } from '@nestjs/common';
import { PredictPoolsService } from './predict-pools.service';
import { PredictPoolsController } from './predict-pools.controller';

@Module({
  controllers: [PredictPoolsController],
  providers: [PredictPoolsService],
})
export class PredictPoolsModule {}
