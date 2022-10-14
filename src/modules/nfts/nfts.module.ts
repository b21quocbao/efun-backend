import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftsService } from './nfts.service';
import { NftsController } from './nfts.controller';
import { NftEntity } from './entities/nft.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NftEntity])],
  controllers: [NftsController],
  providers: [NftsService],
  exports: [NftsService],
})
export class NftsModule {}
