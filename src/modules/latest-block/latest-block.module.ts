import { Module } from '@nestjs/common';
import { LatestBlockService } from './latest-block.service';

@Module({
  providers: [LatestBlockService],
})
export class LatestBlockModule {}
