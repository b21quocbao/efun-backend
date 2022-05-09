import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionEntity> {
    return this.transactionRepository.save(createTransactionDto);
  }

  async findAll(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<TransactionEntity[]>> {
    const qb = this.transactionRepository.createQueryBuilder('transactions');

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<TransactionEntity> {
    return this.transactionRepository.findOne(id);
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionEntity> {
    await this.transactionRepository.update(id, updateTransactionDto);
    return this.transactionRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.transactionRepository.delete(id);
  }
}
