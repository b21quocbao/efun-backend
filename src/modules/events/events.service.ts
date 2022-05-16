import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { MoreThanOrEqual, Not, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { GetAllEventDto, GetOtherEventDto } from './dto/get-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { ESortEvent } from './enums/event-type.enum';

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
    search,
    orderBy,
    pageNumber,
    pageSize,
  }: GetAllEventDto): Promise<Response<EventEntity[]>> {
    const qb = this.eventRepository
      .createQueryBuilder('events')
      .leftJoin('events.pools', 'pools')
      .leftJoin('events.category', 'category')
      .leftJoin('events.user', 'user')
      .where('events.deadline >= now()')
      .select([
        'events.*',
        'category.name as category',
        'user.isVerified as "isUserVerified"',
        'user.address as address',
        'SUM(COALESCE(pools.amount::numeric,0)) as "totalAmount"',
      ])
      .groupBy('events.id')
      .addGroupBy('category.name')
      .addGroupBy('user.isVerified')
      .addGroupBy('user.address');
    if (search) {
      qb.andWhere('events.name ILIKE :name', { name: `%${search}%` });
    }
    if (orderBy == ESortEvent.UPCOMING) {
      qb.orderBy('deadline');
    } else if (orderBy == ESortEvent.BIGGEST_EFUN_POOL) {
      qb.orderBy('"totalAmount"', 'DESC');
    }
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

  async findOtherEvents(request: GetOtherEventDto) {
    const { eventId, pageNumber, pageSize } = request;
    const event = await this.eventRepository.findOneOrFail(eventId);
    const where = {
      userId: event.userId,
      id: Not(+eventId),
      deadline: MoreThanOrEqual(new Date()),
    };
    const data = await this.eventRepository.find({
      where,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });
    const total = await this.eventRepository.count(where);
    return {
      data,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total,
    };
  }
}
