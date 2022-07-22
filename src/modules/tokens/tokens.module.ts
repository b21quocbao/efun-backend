import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { TokenConsole } from './tokens.console';
import { TokenEntity } from './entities/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity])],
  controllers: [TokensController],
  providers: [TokensService, TokenConsole],
})
export class TokensModule {}
