import { PartialType } from '@nestjs/swagger';
import { CreatePredictPoolDto } from './create-predict-pool.dto';

export class UpdatePredictPoolDto extends PartialType(CreatePredictPoolDto) {}
