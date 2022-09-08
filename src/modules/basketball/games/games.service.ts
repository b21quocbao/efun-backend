// eslint-disable-next-line
const moment = require('moment');
import { Injectable } from '@nestjs/common';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { GameEntity } from './entities/game.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { plainToClass } from 'class-transformer';
import { GetGameDto } from './dto/get-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GoalEntity } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GetGoalDto } from './dto/get-goal.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    @InjectRepository(GoalEntity)
    private goalRepository: Repository<GoalEntity>,
  ) {}

  async create(createGameDto: CreateGameDto): Promise<GameEntity> {
    createGameDto = plainToClass(CreateGameDto, createGameDto);
    return this.gameRepository.save(createGameDto);
  }

  async updateOrCreate(
    updateGameDto: UpdateGameDto,
    findGameDto: Partial<GameEntity>,
  ): Promise<GameEntity> {
    const obj = await this.gameRepository.findOne({ where: findGameDto });
    if (obj) {
      return this.update(obj.id, updateGameDto);
    }

    updateGameDto = plainToClass(CreateGameDto, updateGameDto);
    return this.gameRepository.save(updateGameDto);
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
    getGameDto: GetGameDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<GameEntity[]>> {
    const qb = this.gameRepository
      .createQueryBuilder('games')
      .leftJoinAndSelect('games.league', 'league')
      .leftJoinAndSelect('games.teamAway', 'teamAway')
      .leftJoinAndSelect('games.teamHome', 'teamHome');
    const { leagueId, notFinised, search, nullOddMeta, gameId } = plainToClass(
      GetGameDto,
      getGameDto,
    );

    if (leagueId || leagueId === 0) {
      qb.where('games."leagueId" = :leagueId', { leagueId });
    }

    if (notFinised === true || notFinised === false) {
      if (notFinised) {
        const currentTime = moment.utc().unix();
        qb.andWhere('games."timestamp" > :currentTime', { currentTime });
      } else {
        const currentTime = moment.utc().unix();
        qb.andWhere('games."timestamp" <= :currentTime', { currentTime });
      }
    }
    console.log(nullOddMeta, 'Line #90 games.service.ts');

    if (nullOddMeta === true || nullOddMeta === false) {
      if (nullOddMeta) {
        qb.andWhere(
          new Brackets((qb) => {
            qb.andWhere('games."oddMeta" is NULL').orWhere(
              'games."oddMeta" ILIKE :oddMeta',
              {
                oddMeta: `%[]}`,
              },
            );
          }),
        );
      } else {
        qb.andWhere('games."oddMeta" IS NOT NULL');
        qb.andWhere('games."oddMeta" NOT ILIKE :oddMeta', {
          oddMeta: `%[]}`,
        });
      }
    }

    if (search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.andWhere('league.name ILIKE :leagueName', {
            leagueName: `%${search}%`,
          })
            .orWhere('teamAway.name ILIKE :teamAwayName', {
              teamAwayName: `%${search}%`,
            })
            .orWhere('teamHome.name ILIKE :teamHomeName', {
              teamHomeName: `%${search}%`,
            })
            .orWhere('games."venueName" ILIKE :venueName', {
              venueName: `%${search}%`,
            });
        }),
      );
    }

    if (gameId || gameId === 0) {
      qb.andWhere('games.id = :gameId', { gameId });
    }

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    qb.orderBy('games.date');

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

  async findOne(id: number): Promise<GameEntity> {
    return this.gameRepository.findOne(id);
  }

  async findOneByYear(year: number): Promise<GameEntity> {
    const qb = this.gameRepository.createQueryBuilder('games');

    return qb.where({ year }).getOne();
  }

  async update(id: number, updateGameDto: UpdateGameDto): Promise<GameEntity> {
    await this.gameRepository.update(id, updateGameDto);
    return this.gameRepository.findOne(id);
  }

  async updateGoal(
    id: number,
    updateGoalDto: UpdateGoalDto,
  ): Promise<GoalEntity> {
    await this.goalRepository.update(id, updateGoalDto);
    return this.goalRepository.findOne(id);
  }
}
