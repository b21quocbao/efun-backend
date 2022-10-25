import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateNftDto } from './dto/create-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NftEntity } from './entities/nft.entity';
import { SearchNftDto } from './dto/search-nft.dto';
import { plainToClass } from 'class-transformer';
import { SearchNftOrder } from './enums/search-nft-order.enum';

@Injectable()
export class NftsService {
  constructor(
    @InjectRepository(NftEntity)
    private nftRepository: Repository<NftEntity>,
  ) {}

  async create(createNftDto: CreateNftDto): Promise<NftEntity> {
    return this.nftRepository.save(createNftDto);
  }

  async findAll(
    searchNftDto: SearchNftDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<NftEntity[]>> {
    searchNftDto = plainToClass(SearchNftDto, searchNftDto);
    const qb = this.nftRepository.createQueryBuilder('nfts');

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    if (searchNftDto.userId) {
      qb.where({ userId: searchNftDto.userId });
    }
    if (searchNftDto.orderBy == SearchNftOrder.MOST_PROFIT) {
      qb.orderBy('"buyNav"::numeric', 'DESC');
    }
    if (searchNftDto.orderBy == SearchNftOrder.LEAST_PROFIT) {
      qb.orderBy('"buyNav"::numeric', 'ASC');
    }
    if (searchNftDto.orderBy == SearchNftOrder.OLDEST) {
      qb.orderBy('"createdAt"', 'ASC');
    }
    if (searchNftDto.orderBy == SearchNftOrder.LATEST) {
      qb.orderBy('"createdAt"', 'DESC');
    }

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<NftEntity> {
    return this.nftRepository.findOne(id);
  }

  async update(id: number, updateNftDto: UpdateNftDto): Promise<NftEntity> {
    await this.nftRepository.update(id, updateNftDto);
    return this.nftRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.nftRepository.delete(id);
  }

  async action(id: number, userId: number, action: string): Promise<NftEntity> {
    const nft = await this.nftRepository.findOne(id);
    if (!nft) {
      throw new HttpException({ key: 'NOT_EXISTS' }, HttpStatus.NOT_FOUND);
    }
    if (nft.userId != userId) {
      throw new HttpException(
        { key: 'USER_NOT_OWN_THIS_NFT' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const actions = nft.actions ? JSON.parse(nft.actions) : [];
    actions.push(action);
    await this.nftRepository.update(id, { actions: JSON.stringify(actions) });
    return this.nftRepository.findOne(id);
  }
}
