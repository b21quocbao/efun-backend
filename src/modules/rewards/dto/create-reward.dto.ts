import { RewardStatus } from '../enums/reward-status.enum';

export class CreateRewardDto {
  eventId: number;
  userId: number;
  data: string;
  status: RewardStatus;
}
