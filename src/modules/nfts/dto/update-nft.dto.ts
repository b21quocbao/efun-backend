import { PartialType } from '@nestjs/swagger';
import { CreateNftDto } from './create-nft.dto';

export class UpdateNftDto extends PartialType(CreateNftDto) {
  userId?: number;
  cashBackNav?: string;
  cashBackAmount?: string;
  cashBackTimestamp?: string;
  cashBackFee?: string;
  cashBackTransactionId?: number;
}
