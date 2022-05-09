import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  async create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  async findAll() {
    return `This action returns all reports`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  async update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  async remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
