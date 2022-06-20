import { Injectable } from '@nestjs/common';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryEntity } from './entities/country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(CountryEntity)
    private countryRepository: Repository<CountryEntity>,
  ) {}

  async create(createCountryDto: CreateCountryDto): Promise<CountryEntity> {
    createCountryDto = plainToClass(CreateCountryDto, createCountryDto);
    return this.countryRepository.save(createCountryDto);
  }

  async findAll(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<CountryEntity[]>> {
    const qb = this.countryRepository.createQueryBuilder('countries');

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

  async findOne(id: number): Promise<CountryEntity> {
    return this.countryRepository.findOne(id);
  }

  async findOneByName(name: string): Promise<CountryEntity> {
    const qb = this.countryRepository.createQueryBuilder('leagues');

    return qb.where({ name }).getOne();
  }
}
