import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LatestBlockEntity } from './entities/latest-block.entity';
import { LatestBlockService } from './latest-block.service';

@Module({
  imports: [TypeOrmModule.forFeature([LatestBlockEntity])],
  providers: [LatestBlockService],
})
export class LatestBlockModule {}
