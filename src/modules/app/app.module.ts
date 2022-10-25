import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsoleModule } from 'nestjs-console';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';
import { CategoryEntity } from '../categories/entities/category.entity';
import { CompetitionsModule } from '../competitions/competitions.module';
import { CompetitionEntity } from '../competitions/entities/competition.entity';
import { ContractsModule } from '../contracts/contracts.module';
import { EventEntity } from '../events/entities/event.entity';
import { EventsModule } from '../events/events.module';
import { LatestBlockEntity } from '../latest-block/entities/latest-block.entity';
import { LatestBlockModule } from '../latest-block/latest-block.module';
import { NotificationEntity } from '../notifications/entities/notification.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { PoolEntity } from '../pools/entities/pool.entity';
import { PoolsModule } from '../pools/pools.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { PredictionEntity } from '../predictions/entities/prediction.entity';
import { PredictionsModule } from '../predictions/predictions.module';
import { ReportEntity } from '../reports/entities/report.entity';
import { ReportsModule } from '../reports/reports.module';
import { TokenEntity } from '../tokens/entities/token.entity';
import { TokensModule } from '../tokens/tokens.module';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { UserEntity } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalyticEntity } from '../analytics/entities/analytic.entity';
import { CoinsModule } from '../coins/coins.module';
import { FootballEntities, FootballModules } from '../football';
import {
  BasketballEntities,
  BasketballModules,
} from '../basketball/index.module';
import { CoinEntity } from '../coins/entities/coin.entity';
import { ElpsModule } from '../elps/elps.module';
import { ElpEntity } from '../elps/entities/elp.entity';
import { NftEntity } from '../nfts/entities/nft.entity';
import { NftsModule } from '../nfts/nfts.module';
import { NavsModule } from '../navs/navs.module';
import { NavEntity } from '../navs/entities/nav.entity';
import { AdminModule } from '../admin/admin.module';

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
          TokenEntity,
          EventEntity,
          LatestBlockEntity,
          NotificationEntity,
          PoolEntity,
          PredictionEntity,
          ReportEntity,
          TransactionEntity,
          CompetitionEntity,
          UserEntity,
          AnalyticEntity,
          CoinEntity,
          ElpEntity,
          NftEntity,
          NavEntity,
          ...FootballEntities,
          ...BasketballEntities,
        ],
        synchronize: true,
        schema: configService.get<string>('DB_SCHEMA'),
        logging: process.env.APP_ENV === 'local',
        extra: {
          /*ssl: {
            rejectUnauthorized: false
          }*/
        },
      }),
      inject: [ConfigService],
    }),
    ConsoleModule,
    ScheduleModule.forRoot(),
    CategoriesModule,
    EventsModule,
    LatestBlockModule,
    NotificationsModule,
    PoolsModule,
    AnalyticsModule,
    PredictionsModule,
    ReportsModule,
    TransactionsModule,
    UsersModule,
    AuthModule,
    ContractsModule,
    CompetitionsModule,
    TokensModule,
    CoinsModule,
    ElpsModule,
    NftsModule,
    NavsModule,
    AdminModule,
    ...FootballModules,
    ...BasketballModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
