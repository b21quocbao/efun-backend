import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { GetAllEventDto } from './dto/get-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<EventEntity> {
    return this.eventRepository.save(createEventDto);
  }

  async findAll({
    pageNumber,
    pageSize,
  }: GetAllEventDto): Promise<Response<EventEntity[]>> {
    const qb = this.eventRepository
      .createQueryBuilder('events')
      .leftJoin(
        (qb) =>
          qb
            .select(['events.id as id', 'SUM(pools.amount::numeric) as total'])
            .from(EventEntity, 'events')
            .leftJoin('events.pools', 'pools')
            .groupBy('events.id'),
        'ev',
        'ev.id = events.id',
      )
      .leftJoin('events.category', 'category')
      .leftJoin('events.user', 'user')
      .select([
        'events.*',
        'category.name as category',
        'user.isVerified as "isUserVerified"',
        'user.address as address',
        'ev.total as "totalAmount"',
      ]);
    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    const [rs, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);
    return {
      data: rs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<EventEntity> {
    return this.eventRepository.findOne(id);
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
  ): Promise<EventEntity> {
    await this.eventRepository.update(id, updateEventDto);
    return this.eventRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.eventRepository.delete(id);
  }
}
