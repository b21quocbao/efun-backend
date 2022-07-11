// eslint-disable-next-line
const Web3 = require('web3');
import { Injectable, OnModuleInit } from '@nestjs/common';
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
import { PredictionsService } from '../predictions/predictions.service';
import { PredictionEntity } from '../predictions/entities/prediction.entity';
import { predictionABI } from 'src/shares/contracts/abi/predictionABI';
import { plainToClass } from 'class-transformer';
import { eventABI } from 'src/shares/contracts/abi/eventABI';
import { TxData } from 'ethereumjs-tx';
import { KMSSigner } from 'helpers/kms';
import { getResult } from 'helpers/get-result';
BigNumber.config({ EXPONENTIAL_AT: 100 });

@Injectable()
export class EventsService implements OnModuleInit {
  private web3;
  private predictionContract;
  private eventContract;
  private signer: KMSSigner;

  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(PredictionEntity)
    private predictionRepository: Repository<PredictionEntity>,
  ) {
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));
    this.predictionContract = new this.web3.eth.Contract(
      predictionABI,
      process.env.PREDICTION_PROXY,
    );
    this.eventContract = new this.web3.eth.Contract(
      eventABI,
      process.env.EVENT_PROXY,
    );
    this.signer = new KMSSigner(process.env.KMS_ID, process.env.RPC_URL);
  }

  async onModuleInit() {
    await this.signer.setMetadata();
  }

  async create(
    userId: number,
    createEventDto: CreateEventDto,
  ): Promise<EventEntity> {
    createEventDto = plainToClass(CreateEventDto, createEventDto);
    return this.eventRepository.save({ userId, ...createEventDto });
  }

  async findAll(request: GetAllEventDto): Promise<Response<any[]>> {
    const {
      search,
      orderBy,
      categoryId,
      userId,
      isHot,
      pageNumber,
      pageSize,
      status,
      eventId,
      outOfTime,
      canBlock,
      outOfEndTime,
      subCategoryId,
      competitionId,
      biggestToken,
    } = plainToClass(GetAllEventDto, request);
    const qb = this.eventRepository
      .createQueryBuilder('events')
      .leftJoin('events.predictions', 'predictions')
      .leftJoin('events.category', 'category')
      .leftJoin('events.subCategory', 'subCategory')
      .leftJoin('events.user', 'user')
      .leftJoin('events.competition', 'competition')
      .leftJoin('events.pools', 'pools')
      .leftJoin('events.fixture', 'fixture')
      .leftJoin('predictions.reports', 'reports')
      .select([
        'events.*',
        'array_agg(pools.amount) as "poolAmounts"',
        'array_agg(pools.token) as "poolTokens"',
        'array_agg(pools."claimAmount") as "poolClaimAmounts"',
        'competition.name as competition',
        'category.name as category',
        'fixture.goalsMeta as "goalsMeta"',
        '"subCategory".name as "subCategory"',
        'user.isVerified as "isUserVerified"',
        'user.address as address',
        'array_agg(distinct reports.id) as reports',
        'array_agg(distinct reports.content) as "reportContents"',
        'array_agg(distinct reports.status) as "reportStatus"',
        'array_agg(distinct predictions.userId) as "participants"',
      ])
      .groupBy('events.id')
      .addGroupBy('competition.id')
      .addGroupBy('category.id')
      .addGroupBy('fixture.id')
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
    if (subCategoryId) {
      qb.andWhere('events.subCategoryId = :subCategoryId', { subCategoryId });
    }
    if (competitionId) {
      qb.andWhere('events.competitionId = :competitionId', { competitionId });
    }
    if (eventId || eventId === 0) {
      qb.andWhere('events.id = :eventId', { eventId });
    }
    if (userId) {
      qb.andWhere('events.userId = :userId', { userId });
    }
    if (canBlock === true || canBlock === false) {
      if (canBlock) {
        qb.andWhere('events.finalTime >= NOW()');
        qb.andWhere("events.finalTime <= NOW() + interval '1 day'");
      } else {
        qb.andWhere(
          new Brackets((qb) => {
            qb.andWhere('events.finalTime < NOW()')
              .orWhere("events.finalTime > NOW() + interval '1 day'")
              .orWhere('events.finalTime is null');
          }),
        );
      }
    }
    if (outOfTime === true || outOfTime === false) {
      qb.andWhere(
        outOfTime ? 'events.deadline >= now()' : 'events.deadline < now()',
      );
    }
    if (outOfEndTime === true || outOfEndTime === false) {
      qb.andWhere(
        outOfEndTime ? 'events."endTime" >= now()' : 'events."endTime" < now()',
      );
    }
    if (isHot) {
      qb.andWhere('events.isHot = :isHot', { isHot });
    }
    if (orderBy == ESortEvent.UPCOMING) {
      qb.orderBy('deadline');
    } else if (orderBy == ESortEvent.LATEST) {
      qb.orderBy('"createdAt"', 'DESC');
    }
    if (pageSize && pageNumber) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    const [rs, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);
    const processedRs = await Promise.all(
      rs.map(async (event) => {
        event.poolTokens = event.poolTokens.filter((x: any, index) => {
          if (!x) {
            event.poolAmounts = event.poolAmounts.splice(index, 1);
            return false;
          }
          return true;
        });
        const poolEstimateClaimAmounts = await this.predictionContract.methods
          .getRemainingLP(event.id, event.poolTokens)
          .call()
          .catch(() => '0');
        event.poolTokenAmounts = {};
        event.poolTokenEstimateClaimAmounts = {};
        event.poolTokenClaimAmounts = {};
        event.predictionTokenAmounts = {};

        for (let idx = 0; idx < event.poolTokens.length; ++idx) {
          event.poolTokenAmounts[event.poolTokens[idx]] =
            event.poolAmounts[idx];
          event.poolTokenClaimAmounts[event.poolTokens[idx]] =
            event.poolClaimAmounts[idx];
          event.poolTokenEstimateClaimAmounts[event.poolTokens[idx]] =
            poolEstimateClaimAmounts[idx];
        }
        const predictions = await this.predictionRepository.find({
          eventId: event.id,
        });

        for (const prediction of predictions) {
          if (!event.predictionTokenAmounts[prediction.token]) {
            event.predictionTokenAmounts[prediction.token] = '0';
          }
          event.predictionTokenAmounts[prediction.token] = new BigNumber(
            event.predictionTokenAmounts[prediction.token],
          )
            .plus(prediction.amount)
            .toString();
        }

        delete event.poolAmounts;
        delete event.poolClaimAmounts;
        delete event.poolTokens;
        return event;
      }),
    );

    if (orderBy == ESortEvent.BIGGEST_EFUN_POOL) {
      processedRs.sort((a: any, b: any) => {
        return new BigNumber(a.predictionTokenAmounts[biggestToken] || '0').gt(
          b.predictionTokenAmounts[biggestToken] || '0',
        )
          ? -1
          : 1;
      });
    }

    return {
      data: processedRs.map((row) => {
        return {
          ...row,
          reports: row.participants.filter((x: any) => x !== null),
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

  async findOne(id: number): Promise<any> {
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

  async updateStreamUrl(id: number, streamUrl: string): Promise<void> {
    await this.eventRepository.update(id, { streamUrl });
  }

  async updateScores(
    id: number,
    totalScore: number,
    scoreOne: number,
    scoreTwo: number,
  ): Promise<void> {
    await this.eventRepository.update(id, { totalScore, scoreOne, scoreTwo });
  }

  async blockEvent(id: number): Promise<void> {
    const encodeAbi = await this.eventContract.methods
      .blockEvent(id)
      .encodeABI();

    // The payload we want to sign with the private
    const payload: TxData = {
      gasPrice: Number(await this.web3.eth.getGasPrice()),
      gasLimit: 160000,
      to: process.env.EVENT_PROXY,
      data: encodeAbi,
    };
    await this.signer.sendPayload(payload);
    await this.update(id, { isBlock: true });
  }

  async unblockEvent(id: number): Promise<void> {
    const encodeAbi = await this.eventContract.methods
      .unblockEvent(id)
      .encodeABI();

    // The payload we want to sign with the private
    const payload: TxData = {
      gasPrice: Number(await this.web3.eth.getGasPrice()),
      gasLimit: 160000,
      to: process.env.EVENT_PROXY,
      data: encodeAbi,
    };
    await this.signer.sendPayload(payload);
    await this.update(id, { isBlock: false });
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
      status: EventStatus.AVAILABLE,
      deadline: MoreThanOrEqual(new Date()),
    };
    const data = await this.eventRepository.find({
      where,
      order: {
        deadline: 'DESC',
      },
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

  async getResults(data: string): Promise<string> {
    const eventIds = data.split(',');
    eventIds.pop();
    const arr = [];
    for (const eventId of eventIds) {
      const { data } = await this.findAll({ eventId: +eventId });
      const event = data[0];
      const goalsMeta = JSON.parse(event.goalsMeta);
      arr.push(+eventId);
      arr.push(await getResult(event, goalsMeta.home, goalsMeta.away));
    }
    return JSON.stringify(arr);
  }
}
