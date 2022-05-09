import { Injectable } from '@nestjs/common';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';

@Injectable()
export class PredictionsService {
  async create(createPredictionDto: CreatePredictionDto) {
    return 'This action adds a new prediction';
  }

  async findAll() {
    return `This action returns all predictions`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} prediction`;
  }

  async update(id: number, updatePredictionDto: UpdatePredictionDto) {
    return `This action updates a #${id} prediction`;
  }

  async remove(id: number) {
    return `This action removes a #${id} prediction`;
  }
}
