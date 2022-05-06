import { Module } from '@nestjs/common';
import { LatestBlockService } from './latest-block.service';
import { LatestBlockController } from './latest-block.controller';

@Module({
  controllers: [LatestBlockController],
  providers: [LatestBlockService]
})
export class LatestBlockModule {}
