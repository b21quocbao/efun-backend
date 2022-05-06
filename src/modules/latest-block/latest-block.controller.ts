import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LatestBlockService } from './latest-block.service';
import { CreateLatestBlockDto } from './dto/create-latest-block.dto';
import { UpdateLatestBlockDto } from './dto/update-latest-block.dto';

@Controller('latest-block')
export class LatestBlockController {
  constructor(private readonly latestBlockService: LatestBlockService) {}

  @Post()
  create(@Body() createLatestBlockDto: CreateLatestBlockDto) {
    return this.latestBlockService.create(createLatestBlockDto);
  }

  @Get()
  findAll() {
    return this.latestBlockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.latestBlockService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLatestBlockDto: UpdateLatestBlockDto) {
    return this.latestBlockService.update(+id, updateLatestBlockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.latestBlockService.remove(+id);
  }
}
