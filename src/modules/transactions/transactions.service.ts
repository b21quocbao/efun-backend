import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  async create(createTransactionDto: CreateTransactionDto) {
    return 'This action adds a new transaction';
  }

  async findAll() {
    return `This action returns all transactions`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  async remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
