// eslint-disable-next-line
const moment = require('moment');
import { Injectable } from '@nestjs/common';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { FixtureEntity } from './entities/fixture.entity';
import { CreateFixtureDto } from './dto/create-fixture.dto';
import { plainToClass } from 'class-transformer';
import { GetFixtureDto } from './dto/get-fixture.dto';
import { UpdateFixtureDto } from './dto/update-fixture.dto';
import { GoalEntity } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GetGoalDto } from './dto/get-goal.dto';

@Injectable()
export class FixturesService {
  constructor(
    @InjectRepository(FixtureEntity)
    private fixtureRepository: Repository<FixtureEntity>,
    @InjectRepository(GoalEntity)
    private goalRepository: Repository<GoalEntity>,
  ) {}

  async create(createFixtureDto: CreateFixtureDto): Promise<FixtureEntity> {
    createFixtureDto = plainToClass(CreateFixtureDto, createFixtureDto);
    return this.fixtureRepository.save(createFixtureDto);
  }

  async updateOrCreate(
    updateFixtureDto: UpdateFixtureDto,
    findFixtureDto: Partial<FixtureEntity>,
  ): Promise<FixtureEntity> {
    const obj = await this.fixtureRepository.findOne({ where: findFixtureDto });
    if (obj) {
      return this.update(obj.id, updateFixtureDto);
    }

    updateFixtureDto = plainToClass(CreateFixtureDto, updateFixtureDto);
    return this.fixtureRepository.save(updateFixtureDto);
  }

  async updateOrCreateGoal(
    updateGoalDto: UpdateGoalDto,
    findGoalDto: Partial<GoalEntity>,
  ): Promise<GoalEntity> {
    const obj = await this.goalRepository.findOne({ where: findGoalDto });
    if (obj) {
      return this.updateGoal(obj.id, updateGoalDto);
    }

    updateGoalDto = plainToClass(CreateGoalDto, updateGoalDto);
    return this.goalRepository.save(updateGoalDto);
  }

  async findAll(
    getFixtureDto: GetFixtureDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<FixtureEntity[]>> {
    const qb = this.fixtureRepository
      .createQueryBuilder('fixtures')
      .leftJoinAndSelect('fixtures.league', 'league')
      .leftJoinAndSelect('fixtures.round', 'round')
      .leftJoinAndSelect('fixtures.teamAway', 'teamAway')
      .leftJoinAndSelect('fixtures.teamHome', 'teamHome');
    const { leagueId, notFinised, search, nullOddMeta } = plainToClass(
      GetFixtureDto,
      getFixtureDto,
    );

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    if (leagueId || leagueId === 0) {
      qb.where('fixtures."leagueId" = :leagueId', { leagueId });
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

    if (search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.andWhere('league.name ILIKE :search', { search: `%${search}%` })
            .orWhere('teamAway.name ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('teamHome.name ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('fixtures."venueName" ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('round."name" ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    qb.orderBy('fixtures.date');

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findAllGoals(
    {}: GetGoalDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<GoalEntity[]>> {
    const qb = this.goalRepository.createQueryBuilder('goals');

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

  async findOne(id: number): Promise<FixtureEntity> {
    return this.fixtureRepository.findOne(id);
  }

  async findOneByYear(year: number): Promise<FixtureEntity> {
    const qb = this.fixtureRepository.createQueryBuilder('fixtures');

    return qb.where({ year }).getOne();
  }

  async update(
    id: number,
    updateFixtureDto: UpdateFixtureDto,
  ): Promise<FixtureEntity> {
    await this.fixtureRepository.update(id, updateFixtureDto);
    return this.fixtureRepository.findOne(id);
  }

  async updateGoal(
    id: number,
    updateGoalDto: UpdateGoalDto,
  ): Promise<GoalEntity> {
    await this.goalRepository.update(id, updateGoalDto);
    return this.goalRepository.findOne(id);
  }
}
