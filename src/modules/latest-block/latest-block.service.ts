import { Injectable } from '@nestjs/common';
import { CreateLatestBlockDto } from './dto/create-latest-block.dto';
import { UpdateLatestBlockDto } from './dto/update-latest-block.dto';

@Injectable()
export class LatestBlockService {
  create(createLatestBlockDto: CreateLatestBlockDto) {
    return 'This action adds a new latestBlock';
  }

  findAll() {
    return `This action returns all latestBlock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} latestBlock`;
  }

  update(id: number, updateLatestBlockDto: UpdateLatestBlockDto) {
    return `This action updates a #${id} latestBlock`;
  }

  remove(id: number) {
    return `This action removes a #${id} latestBlock`;
  }
}
