// eslint-disable-next-line
const moment = require('moment');
import { Injectable } from '@nestjs/common';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { LeagueEntity } from './entities/league.entity';
import { CreateLeagueDto } from './dto/create-league.dto';
import { plainToClass } from 'class-transformer';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { GetLeagueDto } from './dto/get-league.dto';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(LeagueEntity)
    private leagueRepository: Repository<LeagueEntity>,
  ) {}

  async create(createLeagueDto: CreateLeagueDto): Promise<LeagueEntity> {
    createLeagueDto = plainToClass(CreateLeagueDto, createLeagueDto);
    return this.leagueRepository.save(createLeagueDto);
  }

  async updateOrCreate(
    updateLeagueDto: UpdateLeagueDto,
    findLeagueDto: Partial<LeagueEntity>,
  ): Promise<LeagueEntity> {
    const obj = await this.leagueRepository.findOne({ where: findLeagueDto });
    if (obj) {
      return this.update(obj.id, updateLeagueDto);
    }

    updateLeagueDto = plainToClass(CreateLeagueDto, updateLeagueDto);
    return this.leagueRepository.save(updateLeagueDto);
  }

  async findAll(
    getLeagueDto: GetLeagueDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<LeagueEntity[]>> {
    const { notFinised, nullOddMeta } = plainToClass(
      GetLeagueDto,
      getLeagueDto,
    );
    const qb = this.leagueRepository
      .createQueryBuilder('leagues')
      .leftJoin('leagues.fixtures', 'fixtures');

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    if (notFinised === true || notFinised === false) {
      if (notFinised) {
        const currentTime = moment.utc().unix();
        qb.andWhere('fixtures."timestamp" > :currentTime', { currentTime });
      } else {
        const currentTime = moment.utc().unix();
        qb.andWhere('fixtures."timestamp" <= :currentTime', { currentTime });
      }
    }

    if (nullOddMeta === true || nullOddMeta === false) {
      if (nullOddMeta) {
        qb.andWhere(
          new Brackets((qb) => {
            qb.andWhere('fixtures."oddMeta" is NULL').orWhere(
              'fixtures."oddMeta" ILIKE :search',
              {
                search: `%[]}`,
              },
            );
          }),
        );
      } else {
        qb.andWhere('fixtures."oddMeta" IS NOT NULL');
        qb.andWhere('fixtures."oddMeta" NOT ILIKE :search', {
          search: `%[]}`,
        });
      }
    }

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<LeagueEntity> {
    return this.leagueRepository.findOne(id);
  }

  async findOneByName(name: string): Promise<LeagueEntity> {
    const qb = this.leagueRepository.createQueryBuilder('leagues');

    return qb.where({ name }).getOne();
  }

  async findOneByRemoteId(remoteId: number): Promise<LeagueEntity> {
    const qb = this.leagueRepository.createQueryBuilder('leagues');

    return qb.where({ remoteId }).getOne();
  }

  async save(league: LeagueEntity): Promise<LeagueEntity> {
    return this.leagueRepository.save(league);
  }

  async update(
    id: number,
    updateLeagueDto: UpdateLeagueDto,
  ): Promise<LeagueEntity> {
    await this.leagueRepository.update(id, updateLeagueDto);
    return this.leagueRepository.findOne(id);
  }
}
