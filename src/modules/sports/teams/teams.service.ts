import { Injectable } from '@nestjs/common';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { plainToClass } from 'class-transformer';
import { GetTeamDto } from './dto/get-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamEntity)
    private teamRepository: Repository<TeamEntity>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<TeamEntity> {
    createTeamDto = plainToClass(CreateTeamDto, createTeamDto);
    return this.teamRepository.save(createTeamDto);
  }

  async createOrUpdate(createTeamDto: CreateTeamDto): Promise<TeamEntity> {
    createTeamDto = plainToClass(CreateTeamDto, createTeamDto);
    return this.teamRepository.save(createTeamDto);
  }

  async findAll(
    {}: GetTeamDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<TeamEntity[]>> {
    const qb = this.teamRepository.createQueryBuilder('teams');

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

  async findOne(id: number): Promise<TeamEntity> {
    return this.teamRepository.findOne(id);
  }

  async findOneByYear(year: number): Promise<TeamEntity> {
    const qb = this.teamRepository.createQueryBuilder('teams');

    return qb.where({ year }).getOne();
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<TeamEntity> {
    await this.teamRepository.update(id, updateTeamDto);
    return this.teamRepository.findOne(id);
  }
}
