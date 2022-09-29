import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Brackets, Repository } from 'typeorm';
import { CoinEntity } from './entities/coin.entity';
import { CreateCoinDto } from './dto/create-coin.dto';

@Injectable()
export class CoinsService {
  constructor(
    @InjectRepository(CoinEntity)
    private coinRepository: Repository<CoinEntity>,
  ) {}

  async create(createCoinDto: CreateCoinDto): Promise<void> {
    const coinFound = await this.findOneBySymbol(createCoinDto.symbol);
    const coinEntity = plainToClass(CoinEntity, createCoinDto);
    if (coinFound) {
      coinEntity.id = coinFound.id;
    }
    const coin = this.coinRepository.create(coinEntity);
    await this.coinRepository.save(coin);
  }

  async findAll() {
    return this.coinRepository.find({});
  }

  async findOne(id: number) {
    return this.coinRepository.findOne(id);
  }

  async findOneBySymbol(symbol: string): Promise<CoinEntity> {
    return this.coinRepository
      .createQueryBuilder('coins')
      .where('symbol = :symbol', { symbol })
      .getOne();
  }

  async findOneByText(search: string): Promise<CoinEntity[]> {
    return this.coinRepository
      .createQueryBuilder('coins')
      .andWhere(
        new Brackets((qb) => {
          qb.andWhere('coins.name ILIKE :name', {
            name: `%${search}%`,
          }).orWhere('coins.symbol ILIKE :symbol', {
            symbol: `%${search}%`,
          });
        }),
      )
      .getMany();
  }
}
