import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsoleModule } from 'nestjs-console';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';
import { CategoryEntity } from '../categories/entities/category.entity';
import { EventEntity } from '../events/entities/event.entity';
import { EventsModule } from '../events/events.module';
import { LatestBlockEntity } from '../latest-block/entities/latest-block.entity';
import { LatestBlockModule } from '../latest-block/latest-block.module';
import { NotificationEntity } from '../notifications/entities/notification.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { PoolEntity } from '../pools/entities/pool.entity';
import { PoolsModule } from '../pools/pools.module';
import { PredictionEntity } from '../predictions/entities/prediction.entity';
import { PredictionsModule } from '../predictions/predictions.module';
import { ReportEntity } from '../reports/entities/report.entity';
import { ReportsModule } from '../reports/reports.module';
import { RewardEntity } from '../rewards/entities/reward.entity';
import { RewardsModule } from '../rewards/rewards.module';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { UserEntity } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `./env/.env.${process.env.APP_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get<any>('DB_TYPE'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          CategoryEntity,
          EventEntity,
          LatestBlockEntity,
          NotificationEntity,
          PoolEntity,
          RewardEntity,
          PredictionEntity,
          ReportEntity,
          TransactionEntity,
          UserEntity,
        ],
        synchronize: process.env.APP_ENV === 'local',
        schema: configService.get<string>('DB_SCHEMA'),
        logging: false,
        extra: {
          /*ssl: {
            rejectUnauthorized: false
          }*/
        },
      }),
      inject: [ConfigService],
    }),
    ConsoleModule,
    CategoriesModule,
    EventsModule,
    LatestBlockModule,
    NotificationsModule,
    PoolsModule,
    PredictionsModule,
    ReportsModule,
    RewardsModule,
    TransactionsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
