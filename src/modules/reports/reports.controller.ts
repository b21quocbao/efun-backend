import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { ReportEntity } from './entities/report.entity';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(
    @Body() createReportDto: CreateReportDto,
  ): Promise<ReportEntity> {
    return this.reportsService.create(createReportDto);
  }

  @Get()
  async findAll(): Promise<Response<ReportEntity[]>> {
    return this.reportsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReportEntity> {
    return this.reportsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<ReportEntity> {
    return this.reportsService.update(+id, updateReportDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.reportsService.remove(+id);
  }
}
