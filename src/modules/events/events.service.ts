import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { Brackets, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { GetAllEventDto, GetOtherEventDto } from './dto/get-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { EventStatus } from './enums/event-status.enum';
import { ESortEvent } from './enums/event-type.enum';
import BigNumber from 'bignumber.js';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
  ) {}

  async create(
    userId: number,
    createEventDto: CreateEventDto,
  ): Promise<EventEntity> {
    return this.eventRepository.save({ userId, ...createEventDto });
  }

  async findAll({
    search,
    orderBy,
    categoryId,
    userId,
    isHot,
    pageNumber,
    pageSize,
    status,
    eventId,
  }: GetAllEventDto): Promise<Response<EventEntity[]>> {
    const qb = this.eventRepository
      .createQueryBuilder('events')
      .leftJoin('events.predictions', 'predictions')
      .leftJoin('events.category', 'category')
      .leftJoin('events.subCategory', 'subCategory')
      .leftJoin('events.user', 'user')
      .leftJoin('events.competition', 'competition')
      .leftJoin('events.pools', 'pools')
      .where('events.status = :status ', { status: EventStatus.AVAILABLE })
      .select([
        'events.*',
        'array_agg(pools.amount) as "poolAmounts"',
        'array_agg(pools.token) as "poolTokens"',
        'predictions.token as "predictionToken"',
        'competition.name as competition',
        'category.name as category',
        '"subCategory".name as "subCategory"',
        'user.isVerified as "isUserVerified"',
        'user.address as address',
        'SUM(COALESCE(predictions.amount::numeric,0)) as "predictionAmount"',
        'array_agg(distinct predictions.userId) as "participants"',
      ])
      .groupBy('events.id')
      .addGroupBy('competition.id')
      .addGroupBy('predictions.token')
      .addGroupBy('category.id')
      .addGroupBy('"subCategory".id')
      .addGroupBy('user.id');
    if (status) {
      qb.andWhere('events.status = :status ', { status: status });
    }
    if (search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.andWhere('events.name ILIKE :name', { name: `%${search}%` })
            .orWhere('events.description ILIKE :description', {
              description: `%${search}%`,
            })
            .orWhere('events.options ILIKE :options', {
              options: `%${search}%`,
            })
            .orWhere('events."shortDescription" ILIKE :shortDescription', {
              shortDescription: `%${search}%`,
            });
        }),
      );
    }
    if (categoryId) {
      qb.andWhere('events.categoryId = :categoryId', { categoryId });
    }
    if (eventId || eventId === 0) {
      qb.andWhere('events.id = :id', { id: eventId });
    }
    if (userId) {
      qb.andWhere('events.userId = :userId', { userId });
    } else {
      qb.andWhere('events.deadline >= now()');
    }
    if (isHot) {
      qb.andWhere('events.isHot = :isHot', { isHot });
    }
    if (orderBy == ESortEvent.UPCOMING) {
      qb.orderBy('deadline');
    } else if (orderBy == ESortEvent.BIGGEST_EFUN_POOL) {
      qb.orderBy('"totalAmount"', 'DESC');
    } else if (orderBy == ESortEvent.LATEST) {
      qb.orderBy('"createdAt"', 'DESC');
    }
    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    const [rs, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);
    const newRs = [];
    let i = 0;
    for (const event of rs) {
      event.poolTokenAmounts = {};
      for (let idx = 0; idx < event.poolTokens.length; ++idx) {
        event.poolTokenAmounts[event.poolTokens[idx]] = event.poolAmounts[idx];
      }
    }
    while (i < rs.length) {
      const event = JSON.parse(JSON.stringify(rs[i]));
      event.predictionTokenAmounts = {};
      event.poolTokenAmounts = {};

      let j = 0;
      for (j = i; j < rs.length && rs[j].id == rs[i].id; ++j) {
        if (rs[j].predictionToken) {
          event.predictionTokenAmounts[rs[j].predictionToken] =
            rs[j].predictionAmount;
        }

        for (const key in rs[j].poolTokenAmounts) {
          if (key && key != 'null') {
            if (!event.poolTokenAmounts[key]) {
              event.poolTokenAmounts[key] = '0';
            }
            event.poolTokenAmounts[key] = new BigNumber(
              event.poolTokenAmounts[key],
            )
              .plus(rs[j].poolTokenAmounts[key])
              .toString();
          }
        }
      }
      i = j;
      delete event.poolAmounts;
      delete event.poolTokens;
      delete event.predictionToken;
      delete event.predictionAmount;

      newRs.push(event);
    }
    return {
      data: newRs.map((row) => {
        return {
          ...row,
          participants: row.participants.filter((x: any) => x !== null),
          numParticipants: row.participants.filter((x: any) => x !== null)
            .length,
        };
      }),
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
      total: total,
    };
  }

  async findOne(id: number): Promise<EventEntity> {
    return this.eventRepository
      .createQueryBuilder('events')
      .leftJoin('events.predictions', 'predictions')
      .leftJoin('events.category', 'category')
      .leftJoin('events.subCategory', 'subCategory')
      .leftJoin('events.user', 'user')
      .leftJoin('events.pools', 'pools')
      .where('events.id = :id', { id })
      .select([
        'events.*',
        'array_agg(pools.id) as "poolIds"',
        'array_agg(pools.amount) as "poolAmounts"',
        'array_agg(pools.token) as "poolTokens"',
        'category.name as category',
        '"subCategory".name as "subCategory"',
        'user.isVerified as "isUserVerified"',
        'user.address as address',
        'SUM(COALESCE(predictions.amount::numeric,0)) as "totalAmount"',
      ])
      .groupBy('events.id')
      .addGroupBy('category.name')
      .addGroupBy('"subCategory".name')
      .addGroupBy('user.isVerified')
      .addGroupBy('user.address')
      .getRawOne();
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
  ): Promise<EventEntity> {
    await this.eventRepository.update(id, updateEventDto);
    return this.eventRepository.findOne(id);
  }

  async incView(id: number): Promise<void> {
    await this.eventRepository.update(id, { views: () => 'views + 1' });
  }

  async updateResultProof(id: number, resultProofUrl: string): Promise<void> {
    await this.eventRepository.update(id, { resultProofUrl });
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
