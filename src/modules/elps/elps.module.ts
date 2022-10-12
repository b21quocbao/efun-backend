import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElpsService } from './elps.service';
import { ElpsController } from './elps.controller';
import { ElpEntity } from './entities/elp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ElpEntity])],
  controllers: [ElpsController],
  providers: [ElpsService],
  exports: [ElpsService],
})
export class ElpsModule {}
