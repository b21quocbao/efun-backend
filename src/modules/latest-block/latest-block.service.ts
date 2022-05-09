import { Injectable } from '@nestjs/common';
import { CreateLatestBlockDto } from './dto/create-latest-block.dto';
import { UpdateLatestBlockDto } from './dto/update-latest-block.dto';

@Injectable()
export class LatestBlockService {
  async create(createLatestBlockDto: CreateLatestBlockDto) {
    return 'This action adds a new latestBlock';
  }

  async findAll() {
    return `This action returns all latestBlock`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} latestBlock`;
  }

  async update(id: number, updateLatestBlockDto: UpdateLatestBlockDto) {
    return `This action updates a #${id} latestBlock`;
  }

  async remove(id: number) {
    return `This action removes a #${id} latestBlock`;
  }
}
