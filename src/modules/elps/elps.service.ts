import { Injectable } from '@nestjs/common';
import { CreateElpDto } from './dto/create-elp.dto';
import { UpdateElpDto } from './dto/update-elp.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElpEntity } from './entities/elp.entity';
import { SearchElpDto } from './dto/search-elp.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ElpsService {
  constructor(
    @InjectRepository(ElpEntity)
    private elpRepository: Repository<ElpEntity>,
  ) {}

  async create(createElpDto: CreateElpDto): Promise<ElpEntity> {
    return this.elpRepository.save(createElpDto);
  }

  async findAll(
    searchElpDto: SearchElpDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<ElpEntity[]>> {
    searchElpDto = plainToClass(SearchElpDto, searchElpDto);
    const qb = this.elpRepository.createQueryBuilder('elps');

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    if (searchElpDto.name) {
      qb.where({ name: searchElpDto.name });
    }

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<ElpEntity> {
    return this.elpRepository.findOne(id);
  }

  async update(
    id: number,
    updateElpDto: UpdateElpDto,
  ): Promise<ElpEntity> {
    await this.elpRepository.update(id, updateElpDto);
    return this.elpRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.elpRepository.delete(id);
  }
}
