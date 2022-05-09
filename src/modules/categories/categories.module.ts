import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoryConsole } from './categories.console';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryConsole],
})
export class CategoriesModule {}
