import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Console()
@Injectable()
export class CategoryConsole {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Command({
    command: 'seed-categories-data',
  })
  async seedCategoriesData() {
    this.categoriesService.create({
      name: 'Football',
      logoUrl:
        'https://d1icd6shlvmxi6.cloudfront.net/gsc/L3REGZ/ce/f2/9a/cef29afcffed4f0abe9e08a160463ad0/images/landing/u23.svg?pageId=d9364718-003d-498b-aa32-00a5a86e0e85',
    });
    this.categoriesService.create({
      name: 'Basketball',
      logoUrl:
        'https://d1icd6shlvmxi6.cloudfront.net/gsc/L3REGZ/ce/f2/9a/cef29afcffed4f0abe9e08a160463ad0/images/landing/u27.png?pageId=d9364718-003d-498b-aa32-00a5a86e0e85',
    });
    this.categoriesService.create({
      name: 'Tennis',
      logoUrl:
        'https://d1icd6shlvmxi6.cloudfront.net/gsc/L3REGZ/ce/f2/9a/cef29afcffed4f0abe9e08a160463ad0/images/landing/u7.png?pageId=d9364718-003d-498b-aa32-00a5a86e0e85',
    });
    this.categoriesService.create({
      name: 'Formula 1',
      logoUrl:
        'https://d1icd6shlvmxi6.cloudfront.net/gsc/L3REGZ/ce/f2/9a/cef29afcffed4f0abe9e08a160463ad0/images/landing/u13.png?pageId=d9364718-003d-498b-aa32-00a5a86e0e85',
    });
    this.categoriesService.create({
      name: 'MMA',
      logoUrl:
        'https://d1icd6shlvmxi6.cloudfront.net/gsc/L3REGZ/ce/f2/9a/cef29afcffed4f0abe9e08a160463ad0/images/landing/u10.png?pageId=d9364718-003d-498b-aa32-00a5a86e0e85',
    });
    this.categoriesService.create({
      name: 'Coin Price',
      logoUrl:
        'https://d1icd6shlvmxi6.cloudfront.net/gsc/L3REGZ/ce/f2/9a/cef29afcffed4f0abe9e08a160463ad0/images/landing/u16.svg?pageId=d9364718-003d-498b-aa32-00a5a86e0e85',
    });
    this.categoriesService.create({
      name: 'Politics',
      logoUrl:
        'https://d1icd6shlvmxi6.cloudfront.net/gsc/L3REGZ/ce/f2/9a/cef29afcffed4f0abe9e08a160463ad0/images/landing/u19.svg?pageId=d9364718-003d-498b-aa32-00a5a86e0e85',
    });
  }
}
