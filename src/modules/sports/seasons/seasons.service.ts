import { Injectable } from '@nestjs/common';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeasonEntity } from './entities/season.entity';
import { CreateSeasonDto } from './dto/create-season.dto';
import { plainToClass } from 'class-transformer';
import { GetSeasonDto } from './dto/get-season.dto';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(SeasonEntity)
    private seasonRepository: Repository<SeasonEntity>,
  ) {}

  async create(createSeasonDto: CreateSeasonDto): Promise<SeasonEntity> {
    createSeasonDto = plainToClass(CreateSeasonDto, createSeasonDto);
    return this.seasonRepository.save(createSeasonDto);
  }

  async createOrUpdate(
    createSeasonDto: CreateSeasonDto,
  ): Promise<SeasonEntity> {
    createSeasonDto = plainToClass(CreateSeasonDto, createSeasonDto);
    return this.seasonRepository.save(createSeasonDto);
  }

  async findAll(
    { seasonStart }: GetSeasonDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<SeasonEntity[]>> {
    const qb = this.seasonRepository.createQueryBuilder('seasons');

    if (seasonStart) {
      qb.where('seasons.year >= :seasonStart', {
        seasonStart,
      });
    }

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

  async findOne(id: number): Promise<SeasonEntity> {
    return this.seasonRepository.findOne(id);
  }

  async findOneByYear(year: number): Promise<SeasonEntity> {
    const qb = this.seasonRepository.createQueryBuilder('seasons');

    return qb.where({ year }).getOne();
  }
}
