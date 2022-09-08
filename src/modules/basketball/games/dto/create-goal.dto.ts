import { SUB_TYPE, TYPE } from '../entities/goal.entity';

export class CreateGoalDto {
  gameId?: number;
  type?: TYPE;
  subType?: SUB_TYPE;
  home?: number;
  away?: number;
}
