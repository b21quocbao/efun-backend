import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { ReportEntity } from './entities/report.entity';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(
    @UserID() userId: number,
    @Body() createReportDto: CreateReportDto,
  ): Promise<ReportEntity> {
    return this.reportsService.create({ ...createReportDto, userId });
  }

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
  ): Promise<Response<ReportEntity[]>> {
    return this.reportsService.findAll(pageNumber, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReportEntity> {
    return this.reportsService.findOne(+id);
  }
}
