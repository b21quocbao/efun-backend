import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { TransactionEntity } from './entities/transaction.entity';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
  ): Promise<Response<TransactionEntity[]>> {
    return this.transactionsService.findAll(pageNumber, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TransactionEntity> {
    return this.transactionsService.findOne(+id);
  }
}
