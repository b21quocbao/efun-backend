import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userRepository.save(createUserDto);
  }

  async findAll(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Response<UserEntity[]>> {
    const qb = this.userRepository
      .createQueryBuilder('users')
      .leftJoin('users.events', 'events')
      .leftJoinAndSelect('users.follows', 'follows')
      .leftJoinAndSelect('users.followers', 'followers')
      .leftJoin('events.predictions', 'predictions')
      .leftJoin('predictions.report', 'report')
      .select([
        'users.*',
        'json_agg(DISTINCT (follows.id, follows.nickname, follows.address)) as "followsId"',
        'json_agg(DISTINCT (followers.id, followers.nickname, followers.address)) as "followersId"',
        'COUNT(DISTINCT events.id) as "numEvents"',
        'COUNT(DISTINCT report.id) as "numReports"',
        `COUNT(CASE WHEN events."endTime" <= NOW() - INTERVAL '2 DAY' AND events.result IS NULL THEN 1 END) as "numBlock"`,
      ])
      .groupBy('users.id');

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

  async findOne(id: number) {
    return this.userRepository
      .createQueryBuilder('users')
      .leftJoin('users.events', 'events')
      .leftJoinAndSelect('users.follows', 'follows')
      .leftJoinAndSelect('users.followers', 'followers')
      .leftJoin('events.predictions', 'predictions')
      .leftJoin('predictions.report', 'report')
      .select([
        'users.*',
        'json_agg(DISTINCT (follows.id, follows.nickname, follows.address)) as "followsId"',
        'json_agg(DISTINCT (followers.id, followers.nickname, followers.address)) as "followersId"',
        'COUNT(DISTINCT events.id) as "numEvents"',
        'COUNT(DISTINCT report.id) as "numReports"',
        `COUNT(CASE WHEN events."endTime" <= NOW() - INTERVAL '2 DAY' AND events.result IS NULL THEN 1 END) as "numBlock"`,
      ])
      .groupBy('users.id')
      .where('users.id = :id', { id })
      .getRawOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.userRepository.update(id, updateUserDto);
    return this.userRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async setRefreshToken(refreshToken: string, userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken,
    });
  }

  async setCountry(ip: string, country: string, userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      ip,
      country,
    });
  }

  async getUserIfRefreshTokenMatch(
    refreshToken: string,
    userId: number,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      select: ['id', 'refreshToken'],
      where: {
        id: userId,
      },
    });

    if (!user)
      throw new HttpException({ key: 'NOT_EXISTS' }, HttpStatus.NOT_FOUND);

    const isRefreshTokenMatching = user.refreshToken === refreshToken;

    if (!isRefreshTokenMatching)
      throw new HttpException(
        { key: 'REFRESH_TOKEN_INVALID' },
        HttpStatus.UNAUTHORIZED,
      );

    return user;
  }

  async blockUser(id: number): Promise<void> {
    await this.userRepository.update(id, { isBlocked: true });
  }

  async findByAddress(address: string): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder('users')
      .leftJoin('users.events', 'events')
      .leftJoinAndSelect('users.follows', 'follows')
      .leftJoinAndSelect('users.followers', 'followers')
      .leftJoin('events.predictions', 'predictions')
      .leftJoin('predictions.report', 'report')
      .select([
        'users.*',
        'json_agg(DISTINCT (follows.id, follows.nickname, follows.address)) as "followsId"',
        'json_agg(DISTINCT (followers.id, followers.nickname, followers.address)) as "followersId"',
        'COUNT(DISTINCT events.id) as "numEvents"',
        'COUNT(DISTINCT report.id) as "numReports"',
        `COUNT(CASE WHEN events."endTime" <= NOW() - INTERVAL '2 DAY' AND events.result IS NULL THEN 1 END) as "numBlock"`,
      ])
      .groupBy('users.id')
      .where('users.address ILIKE :address', { address: `%${address}%` })
      .getRawOne();
  }

  async updateDescription(id: number, description: string): Promise<void> {
    await this.userRepository.update(id, { description });
  }

  async updateNickname(id: number, nickname: string): Promise<void> {
    const user = await this.userRepository.findOne(id);
    const userNickname = await this.userRepository.findOne({
      where: { nickname },
    });
    if ((user.nickname && user.changedNickname) || userNickname) {
      throw new HttpException(
        { key: 'Nickname already exists' },
        HttpStatus.CONFLICT,
      );
    }
    if (user.nickname) {
      await this.userRepository.update(id, { nickname, changedNickname: true });
    } else {
      await this.userRepository.update(id, { nickname });
    }
  }

  async updateBannerUrl(id: number, bannerUrl: string): Promise<void> {
    await this.userRepository.update(id, { bannerUrl });
  }

  async follow(id: number, followId: number): Promise<void> {
    const user = await this.userRepository.findOne(id, {
      join: {
        alias: 'users',
        leftJoinAndSelect: { follows: 'users.follows' },
      },
    });
    const follower = await this.userRepository.findOne(followId);
    if (!user || !follower) {
      throw new HttpException({ key: 'User not found' }, HttpStatus.NOT_FOUND);
    }

    if (!user.follows) {
      user.follows = [];
    }
    if (!user.follows.map((x) => x.id).includes(followId)) {
      user.follows.push(follower);
    }
    await this.userRepository.save(user);
  }

  async unfollow(id: number, followId: number): Promise<void> {
    const user = await this.userRepository.findOne(id, {
      join: {
        alias: 'users',
        leftJoinAndSelect: { follows: 'users.follows' },
      },
    });
    const follower = await this.userRepository.findOne(followId);
    if (!user || !follower) {
      throw new HttpException({ key: 'User not found' }, HttpStatus.NOT_FOUND);
    }

    if (!user.follows) {
      user.follows = [];
    }
    user.follows = user.follows.filter((x) => x.id !== followId);
    await this.userRepository.save(user);
  }

  async whitelistUser(addresses: string[]): Promise<void> {
    for (const address of addresses) {
      const user = await this.findByAddress(address);
      if (!user) {
        await this.userRepository.insert({ address, whitelisted: true });
      } else {
        await this.userRepository.update({ address }, { whitelisted: true });
      }
    }
  }

  async removeWhitelistUser(addresses: string[]): Promise<void> {
    for (const address of addresses) {
      const user = await this.findByAddress(address);
      if (!user) {
        await this.userRepository.insert({ address, whitelisted: false });
      } else {
        await this.userRepository.update({ address }, { whitelisted: false });
      }
    }
  }
}
