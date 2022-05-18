import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { UsersModule } from '../users/users.module';
import { LatestBlockModule } from '../latest-block/latest-block.module';
import { ContractConsole } from './contracts.console';
import { EventsModule } from '../events/events.module';
import { RewardsModule } from '../rewards/rewards.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { PoolsModule } from '../pools/pools.module';

@Module({
  imports: [
    TransactionsModule,
    UsersModule,
    LatestBlockModule,
    EventsModule,
    RewardsModule,
    PredictionsModule,
    PoolsModule,
  ],
  providers: [ContractConsole],
})
export class ContractsModule {}
