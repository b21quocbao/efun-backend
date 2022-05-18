import { EventType } from '../enums/event-type.enum';

export class CreateEventDto {
  userId: number;
  name: string;
  thumbnailUrl: string;
  categoryId: number;
  type: EventType;
  scoreData?: string;
  startTime: Date;
  deadline: Date;
  endTime: Date;
  options: string;
  odds: string;
  streamUrl?: string;
  result?: string;
  resultProofUrl?: string;
  transactionId?: number;
}
