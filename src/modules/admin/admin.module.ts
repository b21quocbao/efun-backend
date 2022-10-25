import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';
import { EventsController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [EventsModule, UsersModule],
  controllers: [EventsController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
