import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventEntity } from './entities/event.entity';
import { EventConsole } from './events.console';
import { TransactionsModule } from '../transactions/transactions.module';
import { UsersModule } from '../users/users.module';
import { LatestBlockModule } from '../latest-block/latest-block.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity]),
    TransactionsModule,
    UsersModule,
    LatestBlockModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventConsole],
})
export class EventsModule {}
