import { EventType } from '../enums/event-type.enum';

export class CreateEventDto {
  userId: number;
  name: string;
  thumbnailUrl: string;
  categoryId: number;
  type: EventType;
  scoreData?: string;
  deadline: Date;
  endTime: Date;
  optionDetails: string;
  streamUrl?: string;
  views: number;
  result?: string;
  resultProofUrl?: string;
}
