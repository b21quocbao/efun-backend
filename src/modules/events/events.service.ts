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
import { plainToClass } from 'class-transformer';
import { eventABI } from 'src/shares/contracts/abi/eventABI';
import { TxData } from 'ethereumjs-tx';
import { KMSSigner } from 'helpers/kms';
import { getResult } from 'helpers/get-result';
import { UsersService } from '../users/users.service';
import { CoinsService } from '../coins/coins.service';
BigNumber.config({ EXPONENTIAL_AT: 100 });

@Injectable()
export class EventsService implements OnModuleInit {
  private web3;
  private eventContract;
  private signer: KMSSigner;

  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    private userService: UsersService,
    private coinService: CoinsService,
  ) {
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));
    this.eventContract = new this.web3.eth.Contract(
      eventABI,
      process.env.EVENT_PROXY,
    );
    if (process.env.KMS_ID && process.env.KMS_ID.length) {
      this.signer = new KMSSigner(process.env.KMS_ID, process.env.RPC_URL);
    }
  }

  async onModuleInit() {
    // const events = await this.eventRepository.find();
    // // console.log(events, 'Line #52 events.service.ts');
    // for (const event of events) {
    //   await this.recalPool(event.id);
    // }
    if (process.env.KMS_ID && process.env.KMS_ID.length) {
      await this.signer.setMetadata();
    }
  }

  async create(
    userId: number,
    createEventDto: CreateEventDto,
  ): Promise<EventEntity> {
    createEventDto = plainToClass(CreateEventDto, createEventDto);
    return this.eventRepository.save({ userId, ...createEventDto });
  }

  async findAll(request: GetAllEventDto): Promise<Response<any[]>> {
    const { followFirst, pageNumber, pageSize } = plainToClass(
      GetAllEventDto,
      request,
    );

    if (followFirst) {
      const x = await this.findAll2({ ...request, isFollowFirst: true });
      const y = await this.findAll2({
        ...request,
        isFollowFirst: false,
        pageNumber,
        pageSize,
        skip: x.total,
      });
      if (x.total >= pageNumber * pageSize) {
        return {
          ...x,
          total: x.total + y.total,
        };
      } else {
        return {
          ...x,
          data: x.data.concat(y.data),
          total: x.total + y.total,
        };
      }
    } else {
      return this.findAll2(request);
    }
  }

  async findAll2(request: GetAllEventDto): Promise<Response<any[]>> {
    const {
      search,
      orderBy,
      categoryId,
      pro,
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
      outOfEndTime30day,
      homeList,
      isFollowFirst,
      skip,
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
        `json_agg(DISTINCT jsonb_build_object('token', pools.token, 'amount', pools.amount, 'claimAmount', pools."claimAmount")) as "poolTokens"`,
        `case when ${
          loginUserId || 0
        } = ANY(array_agg(predictions.userId)) then true else false end as predicted`,
        'competition.name as competition',
        'category.name as category',
        'fixture.goalsMeta as "goalsMeta"',
        'fixture.statusShort as "statusShort"',
        '"subCategory".name as "subCategory"',
        'user.isVerified as "isUserVerified"',
        'user.nickname as "userNickname"',
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
    if (pro || pro == 0) {
      qb.andWhere('events.pro = :pro', { pro });
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
    if (outOfEndTime30day === true || outOfEndTime30day === false) {
      qb.andWhere(
        outOfEndTime30day
          ? `events."endTime" >= now()  - INTERVAL '30 DAY'`
          : `events."endTime" < now()  - INTERVAL '30 DAY'`,
      );
    }
    if (outOfTimeBeforeEnd === true) {
      qb.andWhere('events.deadline < now()');
      qb.andWhere('events."endTime" > now()');
    }
    if (isHot) {
      qb.andWhere('events.isHot = :isHot', { isHot });
    }
    if (isFollowFirst === true || isFollowFirst === false) {
      const user = await this.userService.findOne(loginUserId);
      if (isFollowFirst) {
        qb.andWhere('events."userId" IN(:...ids)', {
          ids: user.followsId.map((x: any) => x.f1 || 0),
        });
        qb.andWhere('events.deadline > now()');
      } else {
        qb.andWhere(
          new Brackets((qb) => {
            qb.andWhere('events."userId" NOT IN(:...ids)', {
              ids: user.followsId.map((x: any) => x.f1 || 0),
            }).orWhere('events.deadline <= now()');
          }),
        );
      }
    }
    if (orderBy == ESortEvent.UPCOMING) {
      qb.orderBy('events.deadline');
    } else if (orderBy == ESortEvent.LATEST) {
      qb.orderBy('events."createdAt"', 'DESC');
    }
    if (pageSize && pageNumber && !homeList) {
      qb.limit(
        Math.max(pageSize - Math.max(skip - (pageNumber - 1) * pageSize, 0), 0),
      ).offset(Math.max((pageNumber - 1) * pageSize - skip, 0));
    }

    // eslint-disable-next-line
    let [rs, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);

    if (orderBy == ESortEvent.BIGGEST_EFUN_POOL) {
      rs.sort((a: any, b: any) => {
        return new BigNumber(a.predictionTokenAmounts[biggestToken] || '0').gt(
          b.predictionTokenAmounts[biggestToken] || '0',
        )
          ? -1
          : 1;
      });
    }

    rs = rs.map((event) => {
      Object.keys(event.poolTokenEstimateClaimAmounts).forEach(
        (key: string) => {
          if (
            (event.endTime != 0 &&
              new Date(event.endTime).getTime() + 172800 * 1000 < Date.now() &&
              event.status != EventStatus.FINISH) ||
            event.isBlock
          ) {
            event.poolTokenEstimateClaimAmounts[key] =
              event.poolTokenAmounts[key];
          }
        },
      );

      return {
        ...event,
        reportContents: event.reportContents.filter((x: any) => x !== null),
        reportTypeUploads: event.reportTypeUploads.filter(
          (x: any) => x !== null,
        ),
        participants: event.participants.filter((x: any) => x !== null),
        numParticipants: event.participants.filter((x: any) => x !== null)
          .length,
      };
    });

    for (let i = 0; i < rs.length; ++i) {
      rs[i].index = i;
    }

    if (homeList) {
      rs.sort((a: any, b: any) => {
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

    for (const event of rs) {
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
      rs = rs.filter((rs) => {
        const intersection = JSON.parse(rs.metadata).tokens.filter((x) =>
          tokenIds.includes(x),
        );
        return intersection.length > 0;
      });
      total = rs.length;
    }
    if (eventTypes) {
      eventTypes = typeof eventTypes === 'string' ? [eventTypes] : eventTypes;
      rs = rs.filter((rs) => {
        return eventTypes.includes(JSON.parse(rs.metadata).eventType);
      });
      total = rs.length;
    }
    if (listingStatuses) {
      listingStatuses =
        typeof listingStatuses === 'string'
          ? [listingStatuses]
          : listingStatuses;
      rs = rs.filter((rs) => {
        return listingStatuses.includes(rs.listingStatus);
      });
      total = rs.length;
    }

    if (homeList) {
      rs = rs.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    }

    return {
      data: rs,
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
      if (event.pro == 6) {
        const options = JSON.parse(event.tokenOptions) as number[];
        const coin = await this.coinService.findOne(event.coinId);
        for (let i = 0; i < options.length; i++) {
          if (
            (i != options.length - 1 && Number(coin.volume) < options[i]) ||
            i == options.length - 1
          ) {
            arr.push(i + 1);
            break;
          }
        }
      } else {
        arr.push(await getResult(event, goalsMeta.home, goalsMeta.away));
      }
    }
    return { data: arr.join(',') + ',' };
  }
}
