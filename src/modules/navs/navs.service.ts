import { Injectable } from '@nestjs/common';
import { CreateNavDto } from './dto/create-nav.dto';
import { UpdateNavDto } from './dto/update-nav.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NavEntity } from './entities/nav.entity';
import { SearchNavDto } from './dto/search-nav.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class NavsService {
  constructor(
    @InjectRepository(NavEntity)
    private navRepository: Repository<NavEntity>,
  ) {}

  async create(createNavDto: CreateNavDto): Promise<NavEntity> {
    return this.navRepository.save(createNavDto);
  }

  async findAll(
    searchNavDto: SearchNavDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<NavEntity[]>> {
    const { startTime, endTime } = plainToClass(SearchNavDto, searchNavDto);
    const qb = this.navRepository
      .createQueryBuilder('navs')
      .where(
        'events."createdAt" >= :startTime AND events."createdAt" < :endTime',
        {
          startTime: startTime,
          endTime: endTime,
        },
      );

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

  async findOne(id: number): Promise<NavEntity> {
    return this.navRepository.findOne(id);
  }

  async update(id: number, updateNavDto: UpdateNavDto): Promise<NavEntity> {
    await this.navRepository.update(id, updateNavDto);
    return this.navRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.navRepository.delete(id);
  }
}
