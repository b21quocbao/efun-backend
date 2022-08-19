import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { SearchCategoryDto } from './dto/search-category.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    return this.categoryRepository.save(createCategoryDto);
  }

  async findAll(
    searchCategoryDto: SearchCategoryDto,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<CategoryEntity[]>> {
    searchCategoryDto = plainToClass(SearchCategoryDto, searchCategoryDto);
    const qb = this.categoryRepository.createQueryBuilder('categories');

    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    if (searchCategoryDto.fatherId || searchCategoryDto.fatherId == 0) {
      qb.where({ fatherId: searchCategoryDto.fatherId });
    }

    if (searchCategoryDto.userId || searchCategoryDto.userId == 0) {
      qb.where({ userId: searchCategoryDto.userId });
    }

    if (searchCategoryDto.name) {
      qb.where({ name: searchCategoryDto.name });
    }

    if (searchCategoryDto.nonFather) {
      qb.where({ fatherId: null });
    }

    const [rs, total] = await Promise.all([qb.getMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<CategoryEntity> {
    return this.categoryRepository.findOne(id);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    await this.categoryRepository.update(id, updateCategoryDto);
    return this.categoryRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
