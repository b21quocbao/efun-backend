import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventEntity } from './entities/event.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { UsersModule } from '../users/users.module';
import { LatestBlockModule } from '../latest-block/latest-block.module';
import { PredictionEntity } from '../predictions/entities/prediction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity]),
    TypeOrmModule.forFeature([PredictionEntity]),
    TransactionsModule,
    UsersModule,
    LatestBlockModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
