export class CreateLeagueDto {
  countryId?: number;
  remoteId?: number;
  name?: string;
  type?: string;
  logo?: string;
  startDate?: Date;
  endDate?: Date;
  order?: number;
  meta?: string;
}
