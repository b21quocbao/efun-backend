import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavsService } from './navs.service';
import { NavsController } from './navs.controller';
import { NavEntity } from './entities/nav.entity';
import { NavsConsole } from './navs.console';

@Module({
  imports: [TypeOrmModule.forFeature([NavEntity])],
  controllers: [NavsController],
  providers: [NavsService, NavsConsole],
  exports: [NavsService],
})
export class NavsModule {}
