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
import { PredictionEntity } from '../predictions/entities/prediction.entity';
import { PredictionsModule } from '../predictions/predictions.module';
import { ReportEntity } from '../reports/entities/report.entity';
import { ReportsModule } from '../reports/reports.module';
import { CountriesModule } from '../sports/countries/countries.module';
import { CountryEntity } from '../sports/countries/entities/country.entity';
import { FixtureEntity } from '../sports/fixtures/entities/fixture.entity';
import { GoalEntity } from '../sports/fixtures/entities/goal.entity';
import { FixturesModule } from '../sports/fixtures/fixtures.module';
import { LeagueEntity } from '../sports/leagues/entities/league.entity';
import { LeaguesModule } from '../sports/leagues/leagues.module';
import { BetEntity } from '../sports/odds/entities/bet.entity';
import { BookmakerEntity } from '../sports/odds/entities/bookmaker.entity';
import { OddsModule } from '../sports/odds/odds.module';
import { RoundEntity } from '../sports/rounds/entities/round.entity';
import { RoundsModule } from '../sports/rounds/rounds.module';
import { SeasonEntity } from '../sports/seasons/entities/season.entity';
import { SeasonsModule } from '../sports/seasons/seasons.module';
import { TeamEntity } from '../sports/teams/entities/team.entity';
import { TeamsModule } from '../sports/teams/teams.module';
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
          PredictionEntity,
          ReportEntity,
          TransactionEntity,
          CompetitionEntity,
          UserEntity,
          CountryEntity,
          SeasonEntity,
          LeagueEntity,
          TeamEntity,
          RoundEntity,
          FixtureEntity,
          GoalEntity,
          BetEntity,
          BookmakerEntity,
        ],
        synchronize: process.env.APP_ENV === 'local',
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
    PredictionsModule,
    ReportsModule,
    TransactionsModule,
    UsersModule,
    AuthModule,
    ContractsModule,
    CompetitionsModule,
    CountriesModule,
    SeasonsModule,
    LeaguesModule,
    RoundsModule,
    TeamsModule,
    FixturesModule,
    OddsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
