import { Injectable } from '@nestjs/common';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoundEntity } from './entities/round.entity';
import { CreateRoundDto } from './dto/create-round.dto';
import { plainToClass } from 'class-transformer';
import { GetRoundDto } from './dto/get-round.dto';
import { UpdateRoundDto } from './dto/update-round.dto';

@Injectable()
export class RoundsService {
  constructor(
    @InjectRepository(RoundEntity)
    private roundRepository: Repository<RoundEntity>,
  ) {}

  async create(createRoundDto: CreateRoundDto): Promise<RoundEntity> {
    createRoundDto = plainToClass(CreateRoundDto, createRoundDto);
    return this.roundRepository.save(createRoundDto);
  }

  async updateOrCreate(
    updateRoundDto: UpdateRoundDto,
    findRoundDto: Partial<RoundEntity>,
  ): Promise<RoundEntity> {
    const obj = await this.roundRepository.findOne({ where: findRoundDto });
    if (obj) {
      return this.update(obj.id, updateRoundDto);
    }

    updateRoundDto = plainToClass(CreateRoundDto, updateRoundDto);
    return this.roundRepository.save(updateRoundDto);
  }

  async findAll(
    { leagueId }: GetRoundDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<RoundEntity[]>> {
    const qb = this.roundRepository.createQueryBuilder('rounds');

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    if (leagueId || leagueId === 0) {
      qb.where('rounds."leagueId" = :leagueId', { leagueId });
    }

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<RoundEntity> {
    return this.roundRepository.findOne(id);
  }

  async findOneByYear(year: number): Promise<RoundEntity> {
    const qb = this.roundRepository.createQueryBuilder('rounds');

    return qb.where({ year }).getOne();
  }

  async update(
    id: number,
    updateRoundDto: UpdateRoundDto,
  ): Promise<RoundEntity> {
    await this.roundRepository.update(id, updateRoundDto);
    return this.roundRepository.findOne(id);
  }
}
