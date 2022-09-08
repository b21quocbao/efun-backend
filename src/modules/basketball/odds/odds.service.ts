import { Injectable } from '@nestjs/common';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BetEntity } from './entities/bet.entity';
import { CreateBetDto } from './dto/create-bet.dto';
import { plainToClass } from 'class-transformer';
import { GetBetDto } from './dto/get-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { BookmakerEntity } from './entities/bookmaker.entity';
import { CreateBookmakerDto } from './dto/create-bookmaker.dto';
import { UpdateBookmakerDto } from './dto/update-bookmaker.dto';
import { GetBookmakerDto } from './dto/get-bookmaker.dto';

@Injectable()
export class OddsService {
  constructor(
    @InjectRepository(BetEntity)
    private betRepository: Repository<BetEntity>,
    @InjectRepository(BookmakerEntity)
    private bookmakerRepository: Repository<BookmakerEntity>,
  ) {}

  async createBet(createBetDto: CreateBetDto): Promise<BetEntity> {
    createBetDto = plainToClass(CreateBetDto, createBetDto);
    return this.betRepository.save(createBetDto);
  }

  async updateOrCreateBet(
    updateBetDto: UpdateBetDto,
    findBetDto: Partial<BetEntity>,
  ): Promise<BetEntity> {
    const obj = await this.betRepository.findOne({ where: findBetDto });
    if (obj) {
      return this.updateBet(obj.id, updateBetDto);
    }

    updateBetDto = plainToClass(CreateBetDto, updateBetDto);
    return this.betRepository.save(updateBetDto);
  }

  async findAllBet(
    {}: GetBetDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<BetEntity[]>> {
    const qb = this.betRepository.createQueryBuilder('bets');

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

  async findOneBet(id: number): Promise<BetEntity> {
    return this.betRepository.findOne(id);
  }

  async updateBet(id: number, updateBetDto: UpdateBetDto): Promise<BetEntity> {
    await this.betRepository.update(id, updateBetDto);
    return this.betRepository.findOne(id);
  }

  async createBookmaker(
    createBookmakerDto: CreateBookmakerDto,
  ): Promise<BookmakerEntity> {
    createBookmakerDto = plainToClass(CreateBookmakerDto, createBookmakerDto);
    return this.bookmakerRepository.save(createBookmakerDto);
  }

  async updateOrCreateBookmaker(
    updateBookmakerDto: UpdateBookmakerDto,
    findBookmakerDto: Partial<BookmakerEntity>,
  ): Promise<BookmakerEntity> {
    const obj = await this.bookmakerRepository.findOne({
      where: findBookmakerDto,
    });
    if (obj) {
      return this.updateBookmaker(obj.id, updateBookmakerDto);
    }

    updateBookmakerDto = plainToClass(CreateBookmakerDto, updateBookmakerDto);
    return this.bookmakerRepository.save(updateBookmakerDto);
  }

  async findAllBookmaker(
    {}: GetBookmakerDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<BookmakerEntity[]>> {
    const qb = this.bookmakerRepository.createQueryBuilder('bookmakers');

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

  async findOneBookmaker(id: number): Promise<BookmakerEntity> {
    return this.bookmakerRepository.findOne(id);
  }

  async updateBookmaker(
    id: number,
    updateBookmakerDto: UpdateBookmakerDto,
  ): Promise<BookmakerEntity> {
    await this.bookmakerRepository.update(id, updateBookmakerDto);
    return this.bookmakerRepository.findOne(id);
  }
}
