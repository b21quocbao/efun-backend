import { Injectable } from '@nestjs/common';
import { CreatePoolDto } from './dto/create-pool.dto';
import { UpdatePoolDto } from './dto/update-pool.dto';

@Injectable()
export class PoolsService {
  async create(createPoolDto: CreatePoolDto) {
    return 'This action adds a new pool';
  }

  async findAll() {
    return `This action returns all pools`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} pool`;
  }

  async update(id: number, updatePoolDto: UpdatePoolDto) {
    return `This action updates a #${id} pool`;
  }

  async remove(id: number) {
    return `This action removes a #${id} pool`;
  }
}
