import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { NftsService } from './nfts.service';
import { SearchNftDto } from './dto/search-nft.dto';
import { NftEntity } from './entities/nft.entity';
import { ActionDto } from './dto/action-nft.dto';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';

@ApiTags('Nfts')
@Controller('nfts')
export class NftsController {
  constructor(private readonly nftsService: NftsService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() searchNftDto: SearchNftDto,
  ): Promise<Response<NftEntity[]>> {
    return this.nftsService.findAll(searchNftDto, pageNumber, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<NftEntity> {
    return this.nftsService.findOne(+id);
  }

  @Post(':id/action')
  async action(
    @Param('id') id: string,
    @UserID() userId: number,
    @Body() actionDto: ActionDto,
  ): Promise<NftEntity> {
    return this.nftsService.action(+id, userId, actionDto.action);
  }
}
