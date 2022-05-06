import { PartialType } from '@nestjs/swagger';
import { CreateLatestBlockDto } from './create-latest-block.dto';

export class UpdateLatestBlockDto extends PartialType(CreateLatestBlockDto) {}
