import { Injectable } from '@nestjs/common';
import { CreatePredictPoolDto } from './dto/create-predict-pool.dto';
import { UpdatePredictPoolDto } from './dto/update-predict-pool.dto';

@Injectable()
export class PredictPoolsService {
  create(createPredictPoolDto: CreatePredictPoolDto) {
    return 'This action adds a new pool';
  }

  findAll() {
    return `This action returns all predictPools`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pool`;
  }

  update(id: number, updatePredictPoolDto: UpdatePredictPoolDto) {
    return `This action updates a #${id} pool`;
  }

  remove(id: number) {
    return `This action removes a #${id} pool`;
  }
}
