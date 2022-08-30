import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateResultProofDto {
  @ApiProperty()
  @IsString()
  resultProofUrl: string;

  @ApiProperty()
  @IsString()
  typeUpload: string;
}
