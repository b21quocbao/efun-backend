import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { NftsService } from './nfts.service';
import { SearchNftDto } from './dto/search-nft.dto';
import { NftEntity } from './entities/nft.entity';

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
}
