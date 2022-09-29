import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventEntity } from './entities/event.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { UsersModule } from '../users/users.module';
import { LatestBlockModule } from '../latest-block/latest-block.module';
import { CoinsModule } from '../coins/coins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity]),
    UsersModule,
    CoinsModule,
    TransactionsModule,
    UsersModule,
    LatestBlockModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
