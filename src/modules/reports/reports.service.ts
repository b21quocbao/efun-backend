import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private reportRepository: Repository<ReportEntity>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<ReportEntity> {
    return this.reportRepository.save(createReportDto);
  }

  async findAll(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<ReportEntity[]>> {
    const qb = this.reportRepository.createQueryBuilder('reports');

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

  async findOne(id: number): Promise<ReportEntity> {
    return this.reportRepository.findOne(id);
  }

  async update(
    id: number,
    updateReportDto: UpdateReportDto,
  ): Promise<ReportEntity> {
    await this.reportRepository.update(id, updateReportDto);
    return this.reportRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.reportRepository.delete(id);
  }
}
