import { PartialType } from '@nestjs/swagger';
import { CreateElpDto } from './create-elp.dto';

export class UpdateElpDto extends PartialType(CreateElpDto) {}
