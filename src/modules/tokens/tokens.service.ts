import { Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from './entities/token.entity';
import { SearchTokenDto } from './dto/search-token.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
  ) {}

  async create(createTokenDto: CreateTokenDto): Promise<TokenEntity> {
    return this.tokenRepository.save(createTokenDto);
  }

  async findAll(
    searchTokenDto: SearchTokenDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<TokenEntity[]>> {
    searchTokenDto = plainToClass(SearchTokenDto, searchTokenDto);
    const qb = this.tokenRepository.createQueryBuilder('tokens');

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    if (searchTokenDto.name) {
      qb.where({ name: searchTokenDto.name });
    }

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<TokenEntity> {
    return this.tokenRepository.findOne(id);
  }

  async update(
    id: number,
    updateTokenDto: UpdateTokenDto,
  ): Promise<TokenEntity> {
    await this.tokenRepository.update(id, updateTokenDto);
    return this.tokenRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.tokenRepository.delete(id);
  }
}
