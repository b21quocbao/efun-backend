import { Injectable } from '@nestjs/common';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionEntity } from './entities/competition.entity';
import { SearchCompetitionDto } from './dto/search-competition.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectRepository(CompetitionEntity)
    private competitionRepository: Repository<CompetitionEntity>,
  ) {}

  async create(
    userId: number,
    createCompetitionDto: CreateCompetitionDto,
  ): Promise<CompetitionEntity> {
    return this.competitionRepository.save({ userId, ...createCompetitionDto });
  }

  async findAll(
    searchCompetitionDto: SearchCompetitionDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<CompetitionEntity[]>> {
    searchCompetitionDto = plainToClass(
      SearchCompetitionDto,
      searchCompetitionDto,
    );
    const qb = this.competitionRepository.createQueryBuilder('competitions');

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    if (searchCompetitionDto.name) {
      qb.where('competitions.name ILIKE :name', {
        name: `%${searchCompetitionDto.name}%`,
      });
    }

    if (searchCompetitionDto.categoryId) {
      qb.where('competitions."categoryId" = :categoryId', {
        categoryId: searchCompetitionDto.categoryId,
      });
    }

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<CompetitionEntity> {
    return this.competitionRepository.findOne(id);
  }

  async update(
    id: number,
    updateCompetitionDto: UpdateCompetitionDto,
  ): Promise<CompetitionEntity> {
    await this.competitionRepository.update(id, updateCompetitionDto);
    return this.competitionRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.competitionRepository.delete(id);
  }
}
