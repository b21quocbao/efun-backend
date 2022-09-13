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
    // const events = await this.eventRepository.find();
    // // console.log(events, 'Line #52 events.service.ts');
    // for (const event of events) {
    //   console.log(
    //     JSON.parse(event.metadata).tokens,
    //     'Line #54 events.service.ts',
    //   );
    //   await this.update(event.id, {
    //     tokens: JSON.parse(event.metadata).tokens,
    //   });
    // }

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
      loginUserId,
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
      leagueId,
      haveReport,
      biggestToken,
      outOfTimeBeforeEnd,
      outOfEndTime7day,
      homeList,
    } = plainToClass(GetAllEventDto, request);
    let { tokenIds, eventTypes, listingStatuses } = plainToClass(
      GetAllEventDto,
      request,
    );
    const qb = this.eventRepository
      .createQueryBuilder('events')
      .leftJoin('events.predictions', 'predictions')
      .leftJoin('events.category', 'category')
      .leftJoin('events.subCategory', 'subCategory')
      .leftJoin('events.user', 'user')
      .leftJoin('events.competition', 'competition')
      .leftJoin('events.pools', 'pools')
      .leftJoin('events.fixture', 'fixture')
      .leftJoin('predictions.report', 'report')
      .select([
        'events.*',
        'array_agg(pools.amount) as "poolAmounts"',
        'array_agg(pools.token) as "poolTokens"',
        'array_agg(pools."claimAmount") as "poolClaimAmounts"',
        'competition.name as competition',
        'category.name as category',
        'fixture.goalsMeta as "goalsMeta"',
        'fixture.statusShort as "statusShort"',
        '"subCategory".name as "subCategory"',
        'user.isVerified as "isUserVerified"',
        'user.address as address',
        'array_agg(report.content) as "reportContents"',
        'array_agg(report.typeUpload) as "reportTypeUploads"',
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
    if (haveReport === true || haveReport === false) {
      if (haveReport) {
        qb.andWhere('report.id is not null');
      } else {
        qb.andWhere('report.id is null');
      }
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
    if (leagueId) {
      qb.andWhere('events.leagueId = :leagueId', { leagueId });
    }
    if (eventId || eventId === 0) {
      qb.andWhere('events.id = :eventId', { eventId });
    }
    if (userId) {
      qb.andWhere('events.userId = :userId', { userId });
    }
    if (canBlock === true || canBlock === false) {
      if (canBlock) {
        qb.andWhere('events.finalTime <= NOW()');
        qb.andWhere('events.claimTime >= NOW()');
      } else {
        qb.andWhere(
          new Brackets((qb) => {
            qb.andWhere('events.finalTime > NOW()')
              .orWhere('events.claimTime < NOW()')
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
    if (outOfEndTime7day === true || outOfEndTime7day === false) {
      qb.andWhere(
        outOfEndTime7day
          ? `events."endTime" >= now()  - INTERVAL '7 DAY'`
          : `events."endTime" < now()  - INTERVAL '7 DAY'`,
      );
    }
    if (outOfTimeBeforeEnd === true) {
      qb.andWhere('events.deadline < now()');
      qb.andWhere('events."endTime" > now()');
    }
    if (isHot) {
      qb.andWhere('events.isHot = :isHot', { isHot });
    }
    if (orderBy == ESortEvent.UPCOMING) {
      qb.orderBy('deadline');
    } else if (orderBy == ESortEvent.LATEST) {
      qb.orderBy('"createdAt"', 'DESC');
    }
    if (pageSize && pageNumber && !homeList) {
      qb.limit(pageSize).offset((pageNumber - 1) * pageSize);
    }

    // eslint-disable-next-line
    let [rs, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);
    let processedRs = await Promise.all(
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
        event.predictionTokenOptionAmounts = {};

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
          if (prediction.userId == loginUserId) {
            event.predicted = true;
          }
          if (!event.predictionTokenAmounts[prediction.token]) {
            event.predictionTokenAmounts[prediction.token] = '0';
          }
          event.predictionTokenAmounts[prediction.token] = new BigNumber(
            event.predictionTokenAmounts[prediction.token],
          )
            .plus(prediction.amount)
            .toString();

          if (!event.predictionTokenOptionAmounts[prediction.token]) {
            event.predictionTokenOptionAmounts[prediction.token] = {};
          }
          if (
            !event.predictionTokenOptionAmounts[prediction.token][
              prediction.optionIndex
            ]
          ) {
            event.predictionTokenOptionAmounts[prediction.token][
              prediction.optionIndex
            ] = new BigNumber(0);
          }
          event.predictionTokenOptionAmounts[prediction.token][
            prediction.optionIndex
          ] = event.predictionTokenOptionAmounts[prediction.token][
            prediction.optionIndex
          ].plus(prediction.amount);
        }
        for (const token of Object.keys(event.predictionTokenOptionAmounts)) {
          let sum = new BigNumber(0);
          for (const index of Object.keys(
            event.predictionTokenOptionAmounts[token],
          )) {
            sum = sum.plus(event.predictionTokenOptionAmounts[token][index]);
          }
          for (const index of Object.keys(
            event.predictionTokenOptionAmounts[token],
          )) {
            event.predictionTokenOptionAmounts[token][index] = Math.trunc(
              event.predictionTokenOptionAmounts[token][index]
                .div(sum)
                .toNumber() * 100,
            );
          }
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

    processedRs = processedRs.map((row) => {
      return {
        ...row,
        reportContents: row.reportContents.filter((x: any) => x !== null),
        reportTypeUploads: row.reportTypeUploads.filter((x: any) => x !== null),
        participants: row.participants.filter((x: any) => x !== null),
        numParticipants: row.participants.filter((x: any) => x !== null).length,
      };
    });

    for (let i = 0; i < processedRs.length; ++i) {
      processedRs[i].index = i;
    }

    if (homeList) {
      processedRs.sort((a: any, b: any) => {
        const priorityA =
          a.deadline.getTime() > Date.now()
            ? 1
            : a.endTime.getTime() > Date.now()
            ? 2
            : 3;
        const priorityB =
          b.deadline.getTime() > Date.now()
            ? 1
            : b.endTime.getTime() > Date.now()
            ? 2
            : 3;
        if (orderBy == ESortEvent.BIGGEST_EFUN_POOL) {
          const biggestTokenAmountA = new BigNumber(
            a.predictionTokenAmounts[biggestToken] || '0',
          );
          const biggestTokenAmountB = new BigNumber(
            b.predictionTokenAmounts[biggestToken] || '0',
          );
          return priorityA == priorityB
            ? biggestTokenAmountA.gt(biggestTokenAmountB)
              ? -1
              : biggestTokenAmountA.lt(biggestTokenAmountB)
              ? 1
              : priorityA == 1
              ? a.deadline.getTime() - b.deadline.getTime()
              : priorityA == 2
              ? b.deadline.getTime() - a.deadline.getTime()
              : b.endTime.getTime() - a.endTime.getTime()
            : priorityA - priorityB;
        } else if (orderBy == ESortEvent.LATEST) {
          return priorityA == priorityB
            ? b.createdAt.getTime() - a.createdAt.getTime()
            : priorityA - priorityB;
        }
        return priorityA == priorityB
          ? priorityA == 1
            ? a.deadline.getTime() - b.deadline.getTime()
            : priorityA == 2
            ? b.deadline.getTime() - a.deadline.getTime()
            : b.endTime.getTime() - a.endTime.getTime()
          : priorityA - priorityB;
      });
    }

    for (const event of processedRs) {
      event.groupType =
        event.deadline.getTime() > Date.now()
          ? 1
          : event.endTime.getTime() > Date.now()
          ? 2
          : 3;
      if (event.groupType == 1) {
        event.listingStatus = event.predicted > 0 ? 'Predicted' : 'No status';
      } else if (event.groupType == 2) {
        event.listingStatus = 'Locked';
      } else {
        event.listingStatus =
          event.result || event.endTime.getTime() + 172800 * 1000 < Date.now()
            ? 'Ended'
            : 'Pending result';
      }
    }

    if (tokenIds) {
      tokenIds = typeof tokenIds === 'string' ? [tokenIds] : tokenIds;
      processedRs = processedRs.filter((rs) => {
        const intersection = JSON.parse(rs.metadata).tokens.filter((x) =>
          tokenIds.includes(x),
        );
        return intersection.length > 0;
      });
      total = processedRs.length;
    }
    if (eventTypes) {
      eventTypes = typeof eventTypes === 'string' ? [eventTypes] : eventTypes;
      processedRs = processedRs.filter((rs) => {
        return eventTypes.includes(JSON.parse(rs.metadata).eventType);
      });
      total = processedRs.length;
    }
    if (listingStatuses) {
      listingStatuses =
        typeof listingStatuses === 'string'
          ? [listingStatuses]
          : listingStatuses;
      processedRs = processedRs.filter((rs) => {
        return listingStatuses.includes(rs.listingStatus);
      });
      total = processedRs.length;
    }

    if (homeList) {
      processedRs = processedRs.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize,
      );
    }

    return {
      data: processedRs,
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

  async updateResultProof(
    id: number,
    resultProofUrl: string,
    typeUpload: string,
  ): Promise<void> {
    await this.eventRepository.update(id, { resultProofUrl, typeUpload });
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
    await this.update(id, { isBlock: true, claimTime: new Date() });
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
    await this.update(id, { isBlock: false, claimTime: new Date() });
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

  async getResults(data: string): Promise<{ data: string }> {
    const eventIds = data.split(',');
    eventIds.pop();
    const arr = [];
    for (const eventId of eventIds) {
      arr.push(+eventId);
      const { data } = await this.findAll({ eventId: +eventId });
      const event = data[0];
      if (!event || !event.goalsMeta || event.statusShort == 'PST') {
        arr.push(0);
        continue;
      }
      const goalsMeta = JSON.parse(event.goalsMeta);
      await this.updateScores(
        +eventId,
        goalsMeta.home + goalsMeta.away,
        goalsMeta.home,
        goalsMeta.away,
      );
      arr.push(await getResult(event, goalsMeta.home, goalsMeta.away));
    }
    return { data: arr.join(',') + ',' };
  }
}
