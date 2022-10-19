import { PartialType } from '@nestjs/swagger';
import { CreateNavDto } from './create-nav.dto';

export class UpdateNavDto extends PartialType(CreateNavDto) {}
